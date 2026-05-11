import { Router } from 'express';
import { RouteController } from './route.controller';

const router = Router();
const routeController = new RouteController();

// Note: Ensure appropriate authentication middleware is applied
// Admin routes
router.post('/generate', routeController.generateRoute);
router.get('/', routeController.getRoutePlans);
router.get('/my', routeController.getMyRoutes);
router.get('/:id', routeController.getRoutePlanById);
router.post('/:id/assign', routeController.assignRoute);

// Admin/Driver routes for status updates
router.put('/:id/status', routeController.updateRouteStatus);
router.put('/stop/:stopId/status', routeController.updateStopStatus);

export default router;
