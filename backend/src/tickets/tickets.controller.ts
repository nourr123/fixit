import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  // Must come before ':id'-style routes so NestJS doesn't try to match "mine" as an id.
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.ticketsService.findMine(req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() data: Partial<Ticket>, @Req() req: any) {
    // req.user is null for guest submissions, populated if a valid tenant token was sent
    const tenantId = req.user?.role === 'tenant' ? req.user.id : null;
    return this.ticketsService.create(data, tenantId);
  }

  @Post('preview-priority')
  previewPriority(@Body('description') description: string) {
    return this.ticketsService.previewPriority(description);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ticketsService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
