import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Tenant } from '../tenants/tenant.entity';
import { classifyPriority, PriorityResult } from './ticket-priority.util';
import { classifyPriorityWithLLM } from './llm-priority.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
    private readonly mailService: MailService,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({ order: { created_at: 'DESC' } });
  }

  findMine(tenantId: number): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  private async resolvePriority(description: string): Promise<PriorityResult> {
    const llmResult = await classifyPriorityWithLLM(description);
    return llmResult ?? classifyPriority(description);
  }

  async create(
    data: Partial<Ticket>,
    tenantId: number | null,
  ): Promise<Ticket> {
    const result = await this.resolvePriority(data.description ?? '');

    // If the tenant is logged in, pull their email from their account
    // instead of relying on the form to send it (it doesn't, by design).
    let tenantEmail: string | null = data.tenant_email ?? null;
    if (tenantId !== null) {
      const tenant = await this.tenantsRepository.findOneBy({ id: tenantId });
      if (tenant) {
        tenantEmail = tenant.email;
      }
    }

    const ticket = this.ticketsRepository.create({
      ...data,
      tenant_id: tenantId,
      tenant_email: tenantEmail,
      priority: result.priority,
      needs_review: result.needsReview,
    });
    return this.ticketsRepository.save(ticket);
  }

  async previewPriority(description: string): Promise<PriorityResult> {
    return this.resolvePriority(description);
  }

  async updateStatus(id: number, status: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }

    const previousStatus = ticket.status;
    ticket.status = status;
    const updated = await this.ticketsRepository.save(ticket);

    if (previousStatus !== status && updated.tenant_email) {
      void this.mailService.sendTicketStatusUpdate({
        to: updated.tenant_email,
        tenantName: updated.tenant_name,
        ticketId: updated.id,
        description: updated.description,
        newStatus: updated.status,
      });
    }

    return updated;
  }

  async remove(id: number): Promise<{ id: number }> {
    const result = await this.ticketsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return { id };
  }
}