import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import 'reflect-metadata';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { initializeDataSource, dataSource } from './configs';
import envConfig from './configs/envConfig';
import ErrorHandlerMiddleware from './middleware/ErrorHandler';
import { NotFoundMiddleware } from './middleware/NotFound';
import { logError } from './utils/errorLogging';
import { CronJobModule } from './modules/CronJob.module';

dotenv.config();

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  logError(error, {
    type: 'UncaughtException',
    additionalData: {
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  }).catch((logError) => {
    console.error('Failed to log uncaught exception:', logError);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logError(error, {
    type: 'UnhandledRejection',
    additionalData: {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      promise: promise.toString(),
    },
  }).catch((logError) => {
    console.error('Failed to log unhandled rejection:', logError);
  });
});

const PORT = envConfig.PORT;

const initializeApp = async () => {
  try {
    await initializeDataSource();
    Container.set(DataSource, dataSource);
    console.log('TypeDI and TypeORM initialized successfully!');

    const appRoutes = await import('./routes/index');

    const app = express();

    app.use((req, res, next) => {
      const originalJson = express.json();
      originalJson(req, res, (err) => {
        if (err) {
          console.error('JSON Parse Error:', err);
          logError(err, {
            type: 'JSONParseError',
            request: req,
            additionalData: {
              statusCode: 400,
              timestamp: new Date().toISOString(),
            },
          }).catch((logError) => {
            console.error('Failed to log JSON parse error:', logError);
          });

          res.status(400).json({
            statusCode: 400,
            status: 'error',
            message: 'Invalid JSON payload',
          });
          return;
        }
        next();
      });
    });

    app.use(express.json());
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(compression());
    app.use(helmet());
    app.use(cors());
    app.use(morgan('dev'));

    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
    });
    app.use(limiter);

    app.use('/api/', appRoutes.default);

    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: envConfig.NODE_ENV,
      });
    });

    app.get('/', (_req, res) => {
      res.send('Home.');
    });

    app.use(NotFoundMiddleware);
    app.use(ErrorHandlerMiddleware);

    app.listen(PORT, () => {
      if (envConfig.RUN_JOBS) {
        const cronJobModule = Container.get(CronJobModule);
        cronJobModule.startPolling();
      }

      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error during application initialization:', err);
    process.exit(1);
  }
};

initializeApp();
