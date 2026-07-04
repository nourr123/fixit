import { Controller, Get, Post, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Ticket>) {
    return this.ticketsService.create(data);
  }
}