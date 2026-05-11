import { Router } from 'express';
import { 
  getDemandEstimate, 
  getZoneRankings, 
  getComplianceTrend, 
  getWeeklyForecast, 
  getInactiveResidents, 
  clearCache 
} from './analytics.controller';

const router = Router();

router.get('/demand-estimate', getDemandEstimate);
router.get('/zone-rankings', getZoneRankings);
router.get('/compliance-trend', getComplianceTrend);
router.get('/weekly-forecast', getWeeklyForecast);
router.get('/inactive-residents', getInactiveResidents);
router.post('/cache/clear', clearCache);

export default router;
