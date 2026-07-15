import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('manager/login')
  async managerLogin(@Body() dto: { email: string; password: string }) {
    const manager = await this.authService.validateManager(dto.email, dto.password);
    return this.authService.loginManager(manager);
  }

  @Post('tenant/register')
  async tenantRegister(@Body() dto: { full_name: string; email: string; password: string }) {
    const tenant = await this.authService.registerTenant(dto.full_name, dto.email, dto.password);
    return this.authService.loginTenant(tenant);
  }

  @Post('tenant/login')
  async tenantLogin(@Body() dto: { email: string; password: string }) {
    const tenant = await this.authService.validateTenant(dto.email, dto.password);
    return this.authService.loginTenant(tenant);
  }
}