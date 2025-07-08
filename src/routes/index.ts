import express from 'express';
import AppErrorLogRoutes from './appErrorLog.route';
const router = express.Router();

router.use('/app-error-log', AppErrorLogRoutes);

export default router;
