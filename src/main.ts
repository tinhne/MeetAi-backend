import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // prefix
  app.setGlobalPrefix('api/v1');

  // logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3000);
  const nodeEnv = config.get<string>('nodeEnv', 'development');
  const frontendUrl = config.get<string>(
    'app.frontendUrl',
    'http://localhost:5173',
  );

  // validation
  app.useGlobalPipes(GlobalValidationPipe);

  app.useGlobalFilters(
    new GlobalExceptionFilter(app.get(WINSTON_MODULE_PROVIDER)),
  );

  // cors
  app.enableCors({
    origin: nodeEnv === 'production' ? frontendUrl : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();
