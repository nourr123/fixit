import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Manager } from '../managers/manager.entity';
import { Tenant } from '../tenants/tenant.entity';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let managersRepository: { findOne: jest.Mock };
  let tenantsRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mailService: { sendPasswordResetEmail: jest.Mock };

  beforeEach(async () => {
    managersRepository = { findOne: jest.fn() };
    tenantsRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    mailService = { sendPasswordResetEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Manager), useValue: managersRepository },
        { provide: getRepositoryToken(Tenant), useValue: tenantsRepository },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('fake-jwt-token') } },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateManager', () => {
    it('throws UnauthorizedException when manager does not exist', async () => {
      managersRepository.findOne.mockResolvedValue(null);
      await expect(service.validateManager('a@b.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password does not match', async () => {
      managersRepository.findOne.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.validateManager('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the manager when credentials are valid', async () => {
      const manager = { id: 1, email: 'a@b.com', password: 'hashed' };
      managersRepository.findOne.mockResolvedValue(manager);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateManager('a@b.com', 'correct');
      expect(result).toEqual(manager);
    });
  });

  describe('registerTenant', () => {
    it('throws ConflictException when email already exists', async () => {
      tenantsRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(
        service.registerTenant('John', 'a@b.com', 'pass'),
      ).rejects.toThrow(ConflictException);
    });

    it('creates and saves a new tenant when email is free', async () => {
      tenantsRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      tenantsRepository.create.mockReturnValue({ id: 1, email: 'a@b.com' });
      tenantsRepository.save.mockResolvedValue({ id: 1, email: 'a@b.com' });

      const result = await service.registerTenant('John', 'a@b.com', 'pass');
      expect(tenantsRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, email: 'a@b.com' });
    });
  });

  describe('requestPasswordReset', () => {
    it('resolves silently when no tenant matches the email', async () => {
      tenantsRepository.findOne.mockResolvedValue(null);
      await expect(service.requestPasswordReset('unknown@b.com')).resolves.toBeUndefined();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('generates a token and sends an email when tenant exists', async () => {
      tenantsRepository.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });
      tenantsRepository.save.mockResolvedValue({});
      await service.requestPasswordReset('a@b.com');
      expect(tenantsRepository.save).toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException when token is invalid or expired', async () => {
      tenantsRepository.findOne.mockResolvedValue(null);
      await expect(service.resetPassword('bad-token', 'newpass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('updates the password when token is valid', async () => {
      const futureDate = new Date(Date.now() + 60000);
      tenantsRepository.findOne.mockResolvedValue({
        id: 1,
        reset_token: 'valid-token',
        reset_token_expires: futureDate,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      tenantsRepository.save.mockResolvedValue({});
      await service.resetPassword('valid-token', 'newpass');
      expect(tenantsRepository.save).toHaveBeenCalled();
    });
  });
});