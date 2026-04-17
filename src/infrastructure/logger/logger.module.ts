import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('nodeEnv') === 'production';

        return {
          transports: [
            new winston.transports.Console({
              format: isProduction
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                  )
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.printf(
                      ({ timestamp, level, message, context, ...meta }) => {
                        const ctx =
                          typeof context === 'string'
                            ? `[${String(context)}]`
                            : '';
                        const extra = Object.keys(meta).length
                          ? JSON.stringify(meta)
                          : '';
                        return `${String(timestamp)} ${level} ${ctx} ${String(message)} ${extra}`.trim();
                      },
                    ),
                  ),
            }),
          ],
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
