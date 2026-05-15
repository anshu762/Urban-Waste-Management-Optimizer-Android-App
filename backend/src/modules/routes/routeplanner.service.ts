import { RouteRepository } from './route.repository';
import { notificationService } from '../notifications/notification.service';
import { Errors } from '../../lib/app-error';

export class RoutePlannerService {
  private routeRepository: RouteRepository;

  constructor() {
    this.routeRepository = new RouteRepository();
  }

  private formatDate(d: Date): string {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private sortHouseholds(households: any[]) {
    households.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      const blockA = a.block || '';
      const blockB = b.block || '';
      if (blockA !== blockB) return blockA.localeCompare(blockB);
      const streetA = a.street || '';
      const streetB = b.street || '';
      return streetA.localeCompare(streetB);
    });
  }

  /**
   * Generates route plan(s) for a zone+date.
   * - If ASSIGNED/IN_PROGRESS routes exist → auto-appends new stops (does not delete anything)
   * - If only DRAFT routes exist → deletes and creates fresh
   * - If no routes exist → creates fresh DRAFT
   */
  async generateRoutePlan(zoneId: string, date: Date = new Date()) {
    const households = await this.routeRepository.getReadyHouseholdsByZone(zoneId, date);
    if (households.length === 0) throw Errors.noRouteData();

    const existingPlans = await this.routeRepository.findAllRoutePlansByZoneAndDate(zoneId, date);

    const assignedPlanIds: string[] = [];
    const draftPlanIds: string[] = [];

    for (const plan of existingPlans) {
      if (plan.status === 'ASSIGNED' || plan.status === 'IN_PROGRESS') {
        assignedPlanIds.push(plan.id);
      } else {
        draftPlanIds.push(plan.id);
      }
    }

    // Delete old draft plans only — leave assigned ones untouched
    if (draftPlanIds.length > 0) {
      await this.routeRepository.deleteRoutePlansWithStops(draftPlanIds);
    }

    // If assigned plans exist → auto-append new stops
    if (assignedPlanIds.length > 0) {
      const existingStops = await this.routeRepository.getStopsByRoutePlanIds(assignedPlanIds);
      const coveredResidentIds = [...new Set(existingStops.map(s => s.residentProfileId))];
      const newHouseholds = households.filter(h => !coveredResidentIds.includes(h.residentProfileId));

      if (newHouseholds.length === 0) {
        return this.routeRepository.getRoutePlanById(assignedPlanIds[0]);
      }

      this.sortHouseholds(newHouseholds);

      for (const planId of assignedPlanIds) {
        const planStops = existingStops.filter(s => s.routePlanId === planId);
        const lastOrder = planStops.length;

        const stopsData = newHouseholds.map((h, index) => ({
          residentProfileId: h.residentProfileId,
          stopOrder: lastOrder + index + 1,
          priorityScore: h.priorityScore,
        }));

        const updatedPlan = await this.routeRepository.appendStopsToPlan(planId, stopsData);

        // Notify driver
        const driverUserId = (updatedPlan as any).driverProfile?.user?.id;
        const zoneName = (updatedPlan as any).zone?.zoneName;
        if (driverUserId && zoneName) {
          const dateStr = this.formatDate(date);
          await notificationService.notifyUser(
            driverUserId,
            'New Stops Added',
            `${stopsData.length} new stop(s) added to your route for ${zoneName} on ${dateStr}.`,
            { routePlanId: planId, zoneId }
          );
        }
      }

      return this.routeRepository.getRoutePlanById(assignedPlanIds[0]);
    }

    // No assigned plans — create fresh DRAFT
    this.sortHouseholds(households);

    const totalEstimatedStops = households.length;
    const totalPriorityScore = households.reduce((sum, h) => sum + h.priorityScore, 0);

    const routePlan = await this.routeRepository.createRoutePlan({
      zoneId,
      routeDate: date,
      totalEstimatedStops,
      totalPriorityScore,
    });

    const stopsData = households.map((h, index) => ({
      residentProfileId: h.residentProfileId,
      stopOrder: index + 1,
      priorityScore: h.priorityScore,
    }));

    await this.routeRepository.addRouteStops(routePlan.id, stopsData);

    return this.routeRepository.getRoutePlanById(routePlan.id);
  }

  async getRoutePlansByZone(zoneId: string, date?: Date) {
    return this.routeRepository.getRoutePlansByZone(zoneId, date);
  }

  async getMyRoutes(userId: string) {
    return this.routeRepository.getRoutePlansByDriverUserId(userId);
  }

  async getRoutePlanById(id: string) {
    return this.routeRepository.getRoutePlanById(id);
  }

  async assignRoute(routePlanId: string, driverProfileId: string, vehicleId: string) {
    const plan = await this.routeRepository.getRoutePlanForAssignCheck(routePlanId);
    if (!plan) throw Errors.routeNotFound();

    const dateStr = this.formatDate(plan.routeDate);

    // Check 1: Already assigned to a DIFFERENT driver?
    if (plan.driverProfileId && plan.driverProfileId !== driverProfileId) {
      const currentDriverName = (plan.driverProfile as any)?.user?.fullName || 'another driver';
      throw Errors.routeAlreadyAssigned(currentDriverName);
    }

    // Check 2: Driver already busy on this date?
    const driverBusy = await this.routeRepository.findActiveRoutePlanByDriverAndDate(
      driverProfileId, plan.routeDate, routePlanId
    );
    if (driverBusy) {
      throw Errors.driverAlreadyBusy('This driver', driverBusy.id, dateStr);
    }

    // Check 3: Vehicle already busy on this date?
    const vehicleBusy = await this.routeRepository.findActiveRoutePlanByVehicleAndDate(
      vehicleId, plan.routeDate, routePlanId
    );
    if (vehicleBusy) {
      throw Errors.vehicleAlreadyBusy(vehicleId, vehicleBusy.id, dateStr);
    }

    const oldDriverUserId = (plan.driverProfile as any)?.userId;

    const updatedPlan = await this.routeRepository.assignRouteToDriver(routePlanId, driverProfileId, vehicleId);

    // Notify old driver that route was reassigned
    if (oldDriverUserId && oldDriverUserId !== updatedPlan.driverProfile?.user?.userId) {
      await notificationService.notifyUser(
        oldDriverUserId,
        'Route Reassigned',
        `Your route for ${updatedPlan.zone.zoneName} on ${dateStr} has been reassigned. Please check for new assignments.`,
        { routePlanId: updatedPlan.id, zoneId: updatedPlan.zoneId }
      );
    }

    // Notify new driver
    const newDriverUserId = updatedPlan.driverProfile?.user?.userId;
    const zoneName = updatedPlan.zone?.zoneName;
    if (newDriverUserId) {
      await notificationService.notifyUser(
        newDriverUserId,
        'New Route Assigned',
        `You have a route for ${zoneName} on ${dateStr}`,
        { routePlanId: updatedPlan.id, zoneId: updatedPlan.zoneId }
      );
    }

    return updatedPlan;
  }

  async updateStopStatus(stopId: string, status: any, note?: string) {
    return this.routeRepository.updateStopStatus(stopId, status, note);
  }

  async updateRouteStatus(routePlanId: string, status: any) {
    if (status === 'COMPLETED') {
      const stops = await this.routeRepository.getRoutePlanStopSummary(routePlanId);
      const pendingCount = stops.filter((s: any) => s.stopStatus === 'PENDING').length;
      if (pendingCount > 0) {
        throw Errors.routeHasPendingStops(pendingCount);
      }
    }
    return this.routeRepository.updateRoutePlanStatus(routePlanId, status);
  }
}
