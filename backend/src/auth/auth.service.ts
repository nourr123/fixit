import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Manager } from '../managers/manager.entity';
import { Tenant } from '../tenants/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Manager)
    private managersRepository: Repository<Manager>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  // ---------- Managers ----------

  async validateManager(email: string, password: string): Promise<Manager> {
    const manager = await this.managersRepository.findOne({ where: { email } });
    if (!manager) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(password, manager.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return manager;
  }

  loginManager(manager: Manager) {
    const payload = { sub: manager.id, email: manager.email, role: 'manager' as const };
    return {
      access_token: this.jwtService.sign(payload),
      email: manager.email,
    };
  }

  // ---------- Tenants ----------

  async registerTenant(fullName: string, email: string, password: string): Promise<Tenant> {
    const existing = await this.tenantsRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const tenant = this.tenantsRepository.create({
      full_name: fullName,
      email,
      password: hashed,
    });
    return this.tenantsRepository.save(tenant);
  }

  async validateTenant(email: string, password: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({ where: { email } });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatches = await bcrypt.compare(password, tenant.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return tenant;
  }

  loginTenant(tenant: Tenant) {
    const payload = { sub: tenant.id, email: tenant.email, role: 'tenant' as const };
    return {
      access_token: this.jwtService.sign(payload),
      email: tenant.email,
      full_name: tenant.full_name,
    };
  }
}