import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    // Prisma 6 reads DATABASE_URL from process.env automatically
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    // Ensure DATABASE_URL is set in process.env
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl;
    }
    // Prisma 6 doesn't require explicit options - it reads from process.env
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}



