import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  async getDashboardStats(filters: { zoneId?: string; from?: Date; to?: Date }) {
    return this.dashboardRepository.getDashboardStats(filters);
  }

  async getWeeklyLogVolume(zoneId?: string) {
    return this.dashboardRepository.getWeeklyLogVolume(zoneId);
  }

  async getCategoryBreakdown(zoneId?: string, from?: Date, to?: Date) {
    return this.dashboardRepository.getCategoryBreakdown(zoneId, from, to);
  }
}
