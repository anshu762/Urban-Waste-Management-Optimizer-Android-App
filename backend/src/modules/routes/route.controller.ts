import { Request, Response } from 'express';
import { RoutePlannerService } from './routeplanner.service';

export class RouteController {
  private routePlannerService: RoutePlannerService;

  constructor() {
    this.routePlannerService = new RoutePlannerService();
  }

  generateRoute = async (req: Request, res: Response) => {
    try {
      const { zoneId, date } = req.body;
      if (!zoneId) {
        return res.status(400).json({ success: false, message: 'zoneId is required' });
      }

      const planDate = date ? new Date(date) : new Date();
      const plan = await this.routePlannerService.generateRoutePlan(zoneId, planDate);
      res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getRoutePlans = async (req: Request, res: Response) => {
    try {
      const { zoneId, date } = req.query;
      if (!zoneId) {
        return res.status(400).json({ success: false, message: 'zoneId is required' });
      }

      const planDate = date ? new Date(date as string) : undefined;
      const plans = await this.routePlannerService.getRoutePlansByZone(zoneId as string, planDate);
      res.status(200).json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getRoutePlanById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const plan = await this.routePlannerService.getRoutePlanById(id as string);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Route plan not found' });
      }
      res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  assignRoute = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { driverProfileId, vehicleId } = req.body;

      if (!driverProfileId || !vehicleId) {
        return res.status(400).json({ success: false, message: 'driverProfileId and vehicleId are required' });
      }

      const updatedPlan = await this.routePlannerService.assignRoute(id as string, driverProfileId, vehicleId);
      res.status(200).json({ success: true, data: updatedPlan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateRouteStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedPlan = await this.routePlannerService.updateRouteStatus(id as string, status);
      res.status(200).json({ success: true, data: updatedPlan });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateStopStatus = async (req: Request, res: Response) => {
    try {
      const { stopId } = req.params;
      const { status, note } = req.body;
      const updatedStop = await this.routePlannerService.updateStopStatus(stopId as string, status, note);
      res.status(200).json({ success: true, data: updatedStop });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
