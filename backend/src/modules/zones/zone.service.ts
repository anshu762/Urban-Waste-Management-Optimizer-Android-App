import { zoneRepository } from './zone.repository';
import { CreateZoneInput, UpdateZoneInput } from './zone.schema';

export class ZoneService {
  async getAllZones() {
    return await zoneRepository.findAllActiveZones();
  }

  async getZoneById(id: string) {
    const zone = await zoneRepository.findZoneById(id);
    if (!zone || !zone.isActive) {
      throw new Error('Zone not found');
    }
    return zone;
  }

  async createZone(dto: CreateZoneInput) {
    return await zoneRepository.createZone({
      zoneName: dto.zoneName,
      city: dto.city,
      areaCode: dto.areaCode,
    });
  }

  async updateZone(id: string, dto: UpdateZoneInput) {
    const zone = await zoneRepository.findZoneById(id);
    if (!zone || !zone.isActive) {
      throw new Error('Zone not found');
    }
    return await zoneRepository.updateZone(id, dto);
  }

  async deactivateZone(id: string) {
    const zone = await zoneRepository.findZoneById(id);
    if (!zone || !zone.isActive) {
      throw new Error('Zone not found');
    }
    return await zoneRepository.softDeleteZone(id);
  }
}

export const zoneService = new ZoneService();
