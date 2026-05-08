import { RouteRepository } from './route.repository';

export class RoutePlannerService {
  private routeRepository: RouteRepository;

  constructor() {
    this.routeRepository = new RouteRepository();
  }

  /**
   * Generates a RoutePlan for a given zone and date based on active waste logs and open complaints.
   * Priority logic:
   * - Sorted primarily by priorityScore (descending)
   * - Secondarily by block/street grouping
   */
  async generateRoutePlan(zoneId: string, date: Date = new Date()) {
    const households = await this.routeRepository.getReadyHouseholdsByZone(zoneId, date);

    if (households.length === 0) {
      throw new Error('No ready households found for this zone to generate a route.');
    }

    // Find ALL existing route plans for this zone+date and delete every one of them.
    // Using findMany+deleteMany ensures no stale duplicates survive between Optimize calls.
    const existingPlans = await this.routeRepository.findAllRoutePlansByZoneAndDate(zoneId, date);
    if (existingPlans.length > 0) {
      const ids = existingPlans.map((p: { id: string }) => p.id);
      await this.routeRepository.deleteRoutePlansWithStops(ids);
    }

    // Sort by priorityScore (DESC), then by block (ASC), then by street (ASC)
    households.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore; // Descending priority
      }
      
      const blockA = a.block || '';
      const blockB = b.block || '';
      if (blockA !== blockB) {
        return blockA.localeCompare(blockB);
      }

      const streetA = a.street || '';
      const streetB = b.street || '';
      return streetA.localeCompare(streetB);
    });

    const totalEstimatedStops = households.length;
    const totalPriorityScore = households.reduce((sum, h) => sum + h.priorityScore, 0);

    // Create RoutePlan
    const routePlan = await this.routeRepository.createRoutePlan({
      zoneId,
      routeDate: date,
      totalEstimatedStops,
      totalPriorityScore,
    });

    // Create RouteStops sequentially
    const stopsData = households.map((h, index) => ({
      residentProfileId: h.residentProfileId,
      stopOrder: index + 1, // 1-based ordering
      priorityScore: h.priorityScore,
    }));

    await this.routeRepository.addRouteStops(routePlan.id, stopsData);

    // Return the complete plan
    return this.routeRepository.getRoutePlanById(routePlan.id);
  }

  async getRoutePlansByZone(zoneId: string, date?: Date) {
    return this.routeRepository.getRoutePlansByZone(zoneId, date);
  }

  async getRoutePlanById(id: string) {
    return this.routeRepository.getRoutePlanById(id);
  }

  async assignRoute(routePlanId: string, driverProfileId: string, vehicleId: string) {
    return this.routeRepository.assignRouteToDriver(routePlanId, driverProfileId, vehicleId);
  }

  // Used by drivers
  async updateStopStatus(stopId: string, status: any, note?: string) {
    return this.routeRepository.updateStopStatus(stopId, status, note);
  }

  async updateRouteStatus(routePlanId: string, status: any) {
    return this.routeRepository.updateRoutePlanStatus(routePlanId, status);
  }
}
