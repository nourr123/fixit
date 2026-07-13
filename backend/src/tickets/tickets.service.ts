import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { classifyPriority } from './ticket-priority.util';
import { classifyPriorityWithLLM } from './llm-priority.util';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({ order: { created_at: 'DESC' } });
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const description = data.description ?? '';

    const llmResult = await classifyPriorityWithLLM(description);
    const result = llmResult ?? classifyPriority(description);

    const ticket = this.ticketsRepository.create({
      ...data,
      priority: result.priority,
      needs_review: result.needsReview,
    });
    return this.ticketsRepository.save(ticket);
  }

  async updateStatus(id: number, status: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    ticket.status = status;
    return this.ticketsRepository.save(ticket);
  }

  async remove(id: number): Promise<{ id: number }> {
    const result = await this.ticketsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return { id };
  }
}