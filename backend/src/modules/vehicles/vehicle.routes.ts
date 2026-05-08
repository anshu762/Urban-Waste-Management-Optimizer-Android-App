import { Router } from 'express';
import { VehicleController } from './vehicle.controller';

const router = Router();
const vehicleController = new VehicleController();

// Note: Ensure admin authentication middleware is applied when mounting this router
router.get('/', vehicleController.getVehicles);
router.post('/', vehicleController.createVehicle);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
