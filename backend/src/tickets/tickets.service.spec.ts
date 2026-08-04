import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { Tenant } from '../tenants/tenant.entity';
import { MailService } from '../mail/mail.service';
import * as llmPriorityUtil from './llm-priority.util';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepository: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    delete: jest.Mock;
  };
  let tenantsRepository: { findOneBy: jest.Mock };
  let mailService: { sendTicketStatusUpdate: jest.Mock };

  beforeEach(async () => {
    ticketsRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
    };
    tenantsRepository = { findOneBy: jest.fn() };
    mailService = { sendTicketStatusUpdate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: ticketsRepository },
        { provide: getRepositoryToken(Tenant), useValue: tenantsRepository },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);

    // The LLM call hits an external API — always mock it out in unit tests
    jest.spyOn(llmPriorityUtil, 'classifyPriorityWithLLM').mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all tickets ordered by creation date', async () => {
      const tickets = [{ id: 1 }, { id: 2 }];
      ticketsRepository.find.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(ticketsRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findMine', () => {
    it('returns only tickets belonging to the given tenant', async () => {
      const tickets = [{ id: 1, tenant_id: 5 }];
      ticketsRepository.find.mockResolvedValue(tickets);

      const result = await service.findMine(5);

      expect(ticketsRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 5 },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('create', () => {
    it('creates a ticket with a fallback classifier when no tenant is logged in', async () => {
      const created = { id: 1, description: 'Water leak under the sink' };
      ticketsRepository.create.mockReturnValue(created);
      ticketsRepository.save.mockResolvedValue(created);

      const result = await service.create(
        { description: 'Water leak under the sink' },
        null,
      );

      expect(ticketsRepository.create).toHaveBeenCalled();
      expect(ticketsRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('pulls the tenant email from their account when logged in', async () => {
      tenantsRepository.findOneBy.mockResolvedValue({
        id: 7,
        email: 'tenant@example.com',
      });
      ticketsRepository.create.mockImplementation((data) => data);
      ticketsRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.create(
        { description: 'Broken window', tenant_email: 'ignored@example.com' },
        7,
      );

      expect(tenantsRepository.findOneBy).toHaveBeenCalledWith({ id: 7 });
      expect(result.tenant_email).toBe('tenant@example.com');
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when the ticket does not exist', async () => {
      ticketsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateStatus(99, 'Resolved')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates the status and sends a notification email when it changes', async () => {
      const ticket = {
        id: 1,
        status: 'Open',
        tenant_email: 'tenant@example.com',
        tenant_name: 'John',
        description: 'Leaky faucet',
      };
      ticketsRepository.findOneBy.mockResolvedValue(ticket);
      ticketsRepository.save.mockResolvedValue({ ...ticket, status: 'Resolved' });

      const result = await service.updateStatus(1, 'Resolved');

      expect(mailService.sendTicketStatusUpdate).toHaveBeenCalled();
      expect(result.status).toBe('Resolved');
    });

    it('does not send an email when the status does not change', async () => {
      const ticket = {
        id: 1,
        status: 'Open',
        tenant_email: 'tenant@example.com',
      };
      ticketsRepository.findOneBy.mockResolvedValue(ticket);
      ticketsRepository.save.mockResolvedValue(ticket);

      await service.updateStatus(1, 'Open');

      expect(mailService.sendTicketStatusUpdate).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      ticketsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(42)).rejects.toThrow(NotFoundException);
    });

    it('returns the deleted id when deletion succeeds', async () => {
      ticketsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(42);

      expect(result).toEqual({ id: 42 });
    });
  });
});