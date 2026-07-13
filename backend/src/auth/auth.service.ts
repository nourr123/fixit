import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Manager } from '../managers/manager.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Manager)
    private managersRepository: Repository<Manager>,
    private jwtService: JwtService,
  ) {}

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

  login(manager: Manager) {
    const payload = { sub: manager.id, email: manager.email };
    return {
      access_token: this.jwtService.sign(payload),
      email: manager.email,
    };
  }
}