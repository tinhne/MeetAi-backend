import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // imfrastructure
    PrismaModule,
    LoggerModule,

    // feature module:
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
