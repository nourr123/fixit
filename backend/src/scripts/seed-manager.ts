import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { Manager } from '../managers/manager.entity';

async function bootstrap() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log('Usage: npm run seed:manager -- <email> <password>');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const managerRepo = app.get<Repository<Manager>>(getRepositoryToken(Manager));

  const existing = await managerRepo.findOne({ where: { email } });
  if (existing) {
    console.log(`A manager with email "${email}" already exists.`);
    await app.close();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const manager = managerRepo.create({ email, password: hashed });
  await managerRepo.save(manager);

  console.log(`Manager account created: ${email}`);
  await app.close();
}

bootstrap();