import { Module } from '@nestjs/common';
import { PrismaModule, PrismaServiceOptions } from 'nestjs-prisma';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): PrismaServiceOptions => ({
        prismaOptions: {
          datasources: {
            db: {
              url: configService.get<string>('DATABASE_URL'),
            },
          },
        },
        explicitConnect: false,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
