import { apiClient } from '../config/api.config';

export interface DemandEstimate {
  zoneId: string;
  targetDate: string;
  estimatedLogs: number;
  basedOnAvgOf: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ZoneRanking {
  rank: number;
  zoneId: string;
  zoneName: string;
  totalScore: number;
  breakdown: {
    openComplaints: number;
    complaintsScore: number;
    readyLogs: number;
    logsScore: number;
    wetWasteCount: number;
    wetScore: number;
  };
  recommendation: string;
}

export interface ComplianceTrend {
  thisWeekRate: number;
  lastWeekRate: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  changePercent: number;
  insight: string;
  history: number[];
}

export interface WeeklyForecast {
  forecast: {
    date: string;
    dayLabel: string;
    predictedLogs: number;
    hasScheduledPickup: boolean;
    wasteCategories: string[];
  }[];
  dataQuality: 'GOOD' | 'INSUFFICIENT';
}

export interface InactiveResident {
  userId: string;
  fullName: string;
  lastLogDate: string | null;
  daysSinceLastLog: number;
}

export interface InactiveResidentAlerts {
  totalInactive: number;
  totalResidents: number;
  percentage: number;
  residents: InactiveResident[];
  recommendation: string;
}

export const analyticsApi = {
  getDemandEstimate: async (zoneId: string): Promise<DemandEstimate> => {
    const response = await apiClient.get(`/admin/analytics/demand-estimate?zone_id=${zoneId}`);
    return response.data.data;
  },

  getZoneRankings: async (): Promise<ZoneRanking[]> => {
    const response = await apiClient.get(`/admin/analytics/zone-rankings`);
    return response.data.data;
  },

  getComplianceTrend: async (zoneId: string): Promise<ComplianceTrend> => {
    const response = await apiClient.get(`/admin/analytics/compliance-trend?zone_id=${zoneId}`);
    return response.data.data;
  },

  getWeeklyForecast: async (zoneId: string): Promise<WeeklyForecast> => {
    const response = await apiClient.get(`/admin/analytics/weekly-forecast?zone_id=${zoneId}`);
    return response.data.data;
  },

  getInactiveResidents: async (zoneId: string): Promise<InactiveResidentAlerts> => {
    const response = await apiClient.get(`/admin/analytics/inactive-residents?zone_id=${zoneId}`);
    return response.data.data;
  },

  sendBulkNotification: async (userIds: string[], title: string, body: string): Promise<{ count: number }> => {
    const response = await apiClient.post(`/notifications/bulk`, { userIds, title, body });
    return response.data.data;
  }
};
