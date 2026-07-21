import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Manager } from '../managers/manager.entity';
import { Tenant } from '../tenants/tenant.entity';
import { MailService } from '../mail/mail.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3001';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Manager)
    private managersRepository: Repository<Manager>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private jwtService: JwtService,
    private mailService: MailService,
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

  // ---------- Password reset (tenants only) ----------

  async requestPasswordReset(email: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({ where: { email } });

    // Always resolve silently, even if no account exists — this prevents
    // attackers from using this endpoint to discover which emails are registered.
    if (!tenant) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    tenant.reset_token = token;
    tenant.reset_token_expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.tenantsRepository.save(tenant);

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetEmail({ to: tenant.email, resetLink });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({ where: { reset_token: token } });

    if (!tenant || !tenant.reset_token_expires || tenant.reset_token_expires.getTime() < Date.now()) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }

    tenant.password = await bcrypt.hash(newPassword, 10);
    tenant.reset_token = null;
    tenant.reset_token_expires = null;
    await this.tenantsRepository.save(tenant);
  }
}