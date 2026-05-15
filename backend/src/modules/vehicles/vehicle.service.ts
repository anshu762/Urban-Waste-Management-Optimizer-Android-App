import { VehicleRepository } from './vehicle.repository';

export class VehicleService {
  private vehicleRepository: VehicleRepository;

  constructor() {
    this.vehicleRepository = new VehicleRepository();
  }

  async createVehicle(data: { vehicleNumber: string; capacityUnits?: number }) {
    if (!data.vehicleNumber) {
      throw new Error('Vehicle number is required');
    }
    return this.vehicleRepository.createVehicle(data);
  }

  async listVehicles(includeInactive = false, zoneId?: string) {
    return this.vehicleRepository.getAllVehicles(includeInactive, zoneId);
  }

  async getVehicle(id: string) {
    const vehicle = await this.vehicleRepository.getVehicleById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  }

  async updateVehicle(id: string, data: { vehicleNumber?: string; capacityUnits?: number; isActive?: boolean }) {
    return this.vehicleRepository.updateVehicle(id, data);
  }

  async deactivateVehicle(id: string) {
    return this.vehicleRepository.updateVehicle(id, { isActive: false });
  }

  async deleteVehicle(id: string) {
    return this.vehicleRepository.deleteVehicle(id);
  }
}
