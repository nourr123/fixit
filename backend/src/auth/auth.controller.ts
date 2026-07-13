import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('manager/login')
  async managerLogin(@Body() dto: { email: string; password: string }) {
    const manager = await this.authService.validateManager(dto.email, dto.password);
    return this.authService.login(manager);
  }
}