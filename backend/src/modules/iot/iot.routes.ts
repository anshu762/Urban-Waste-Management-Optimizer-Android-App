// Mock IoT for demo purposes: hardware-style ingest plus admin pilot endpoints.
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { generateMockSensorData, getZoneSensorSummary, ingestSensorReading } from './iot.controller';

const router = Router();

router.post('/iot/sensor-readings', ingestSensorReading);
router.get('/iot/zone/:zoneId', authenticate, getZoneSensorSummary);
router.get('/admin/iot/zone/:zoneId', authenticate, authorize('ADMIN'), getZoneSensorSummary);
router.post('/admin/iot/mock/:zoneId', authenticate, authorize('ADMIN'), generateMockSensorData);

export default router;
