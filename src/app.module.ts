import { Module } from '@nestjs/common';
import { PrismaModule, PrismaServiceOptions } from 'nestjs-prisma';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpResponseInterceptor } from './common/interceptors/http-response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
