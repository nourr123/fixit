import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find();
  }

  create(data: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.ticketsRepository.create(data);
    return this.ticketsRepository.save(ticket);
  }
}