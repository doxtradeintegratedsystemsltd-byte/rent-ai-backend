import express from 'express';
import AppErrorLogRoutes from './appErrorLog.route';
import PropertyRoutes from './property.route';
import TenantRoutes from './tenant.route';
import LeaseRoutes from './lease.route';
import UserRoutes from './user.route';
import AuthRoutes from './auth.route';
import UploadRoutes from './upload.route';
import NotificationRoutes from './notification.route';
import JobRoutes from './job.route';
const router = express.Router();

router.use('/notifications', NotificationRoutes);
router.use('/app-error-log', AppErrorLogRoutes);
router.use('/properties', PropertyRoutes);
router.use('/tenants', TenantRoutes);
router.use('/uploads', UploadRoutes);
router.use('/leases', LeaseRoutes);
router.use('/users', UserRoutes);
router.use('/auth', AuthRoutes);
router.use('/jobs', JobRoutes);

export default router;
