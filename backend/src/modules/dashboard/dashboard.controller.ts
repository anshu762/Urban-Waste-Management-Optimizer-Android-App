import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const { zone_id, from, to } = req.query;
      
      const filters = {
        zoneId: zone_id as string,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
      };

      const stats = await this.dashboardService.getDashboardStats(filters);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getWeeklyLogVolume = async (req: Request, res: Response) => {
    try {
      const { zone_id } = req.query;
      const data = await this.dashboardService.getWeeklyLogVolume(zone_id as string);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getCategoryBreakdown = async (req: Request, res: Response) => {
    try {
      const { zone_id, from, to } = req.query;
      const data = await this.dashboardService.getCategoryBreakdown(
        zone_id as string,
        from ? new Date(from as string) : undefined,
        to ? new Date(to as string) : undefined
      );
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  exportDashboardStats = async (req: Request, res: Response) => {
    try {
      const { zone_id, from, to } = req.query;
      const filters = {
        zoneId: zone_id as string,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
      };

      const stats = await this.dashboardService.getDashboardStats(filters);

      // Generate a simple CSV
      const headers = ['Total Households', 'Active Logs Today', 'Open Complaints', 'Resolved Complaints This Week', 'Segregation Compliance (%)', 'Pickups Due Today'];
      const row = [
        stats.totalHouseholds,
        stats.activeLogsToday,
        stats.openComplaints,
        stats.resolvedComplaintsThisWeek,
        stats.segregationCompliance.toFixed(2),
        stats.pickupsDueToday
      ];

      const csvContent = `${headers.join(',')}\n${row.join(',')}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard_stats.csv');
      res.status(200).send(csvContent);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
