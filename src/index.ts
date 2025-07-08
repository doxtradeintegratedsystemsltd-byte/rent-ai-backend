import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import 'reflect-metadata';
import { initializeDataSource } from './configs';
import envConfig from './configs/envConfig';
import ErrorHandlerMiddleware from './middleware/ErrorHandler';
import { NotFoundMiddleware } from './middleware/NotFound';
import appRoutes from './routes/index';
import { logError } from './utils/errorLogging';
// import corsOptions from './utils/cors';

dotenv.config();

// Set up global error handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);

  // Use our new utility to log the error
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

  // Use our new utility to log the error
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

const app = express();
// app.set('trust proxy', true); // Security risk

const PORT = envConfig.PORT;

// Add JSON error handling middleware before the json parser
app.use((req, res, next) => {
  const originalJson = express.json();
  originalJson(req, res, (err) => {
    if (err) {
      // Handle JSON parsing errors
      console.error('JSON Parse Error:', err);

      // Use our new utility to log the error
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
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/api/', appRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: envConfig.NODE_ENV,
  });
});

app.get('/', (_req, res) => {
  res.send('Welcome to Fyxn APIs.');
});

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

initializeDataSource()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
