import express from 'express';
import AppErrorLogRoutes from './appErrorLog.route';
import PropertyRoutes from './property.route';
import TenantRoutes from './tenant.route';
import LeaseRoutes from './lease.route';
import UserRoutes from './user.route';
import AuthRoutes from './auth.route';
const router = express.Router();

router.use('/app-error-log', AppErrorLogRoutes);
router.use('/properties', PropertyRoutes);
router.use('/tenants', TenantRoutes);
router.use('/leases', LeaseRoutes);
router.use('/users', UserRoutes);
router.use('/auth', AuthRoutes);

export default router;
