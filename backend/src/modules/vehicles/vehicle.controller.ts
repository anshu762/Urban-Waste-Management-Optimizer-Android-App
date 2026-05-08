import { Request, Response } from 'express';
import { VehicleService } from './vehicle.service';

export class VehicleController {
  private vehicleService: VehicleService;

  constructor() {
    this.vehicleService = new VehicleService();
  }

  createVehicle = async (req: Request, res: Response) => {
    try {
      const vehicle = await this.vehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  getVehicles = async (req: Request, res: Response) => {
    try {
      const { include_inactive } = req.query;
      const vehicles = await this.vehicleService.listVehicles(include_inactive === 'true');
      res.status(200).json({ success: true, data: vehicles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getVehicleById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vehicle = await this.vehicleService.getVehicle(id as string);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  updateVehicle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vehicle = await this.vehicleService.updateVehicle(id as string, req.body);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteVehicle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.vehicleService.deleteVehicle(id as string);
      res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
