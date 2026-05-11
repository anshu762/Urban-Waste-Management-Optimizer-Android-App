// Mock IoT for demo purposes: controllers for pilot sensor ingestion and admin demos.
import { Request, Response } from 'express';
import { successResponse } from '../../lib/response';
import { iotService } from './iot.service';
import { sensorReadingSchema } from './iot.schema';

export const ingestSensorReading = async (req: Request, res: Response, next: any) => {
  try {
    const { body } = sensorReadingSchema.parse({ body: req.body });
    const reading = await iotService.ingestSensorReading(body);
    successResponse(res, reading, 'Sensor reading ingested', 201);
  } catch (error: any) {
    next(error);
  }
};

export const getZoneSensorSummary = async (req: Request, res: Response, next: any) => {
  try {
    const summary = await iotService.getZoneSensorSummary(String(req.params.zoneId));
    successResponse(res, summary, 'Zone sensor summary retrieved');
  } catch (error: any) {
    next(error);
  }
};

export const generateMockSensorData = async (req: Request, res: Response, next: any) => {
  try {
    const readings = await iotService.generateMockSensorData(String(req.params.zoneId));
    successResponse(res, readings, 'Mock sensor data generated', 201);
  } catch (error: any) {
    next(error);
  }
};
