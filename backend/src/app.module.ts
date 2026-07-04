import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'fixit_user',
      password: process.env.DB_PASSWORD ?? 'fixit_pass',
      database: process.env.DB_NAME ?? 'fixit_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TicketsModule,
  ],
})
export class AppModule {}