import { scheduleRepository } from './schedule.repository';
import { CreateScheduleInput, UpdateScheduleInput } from './schedule.schema';
import { Errors } from '../../lib/app-error';

export class ScheduleService {
  async getSchedulesByZone(zoneId: string) {
    return await scheduleRepository.findSchedulesByZone(zoneId);
  }

  async getUpcomingPickups(zoneId: string) {
    const schedules = await scheduleRepository.findSchedulesByZone(zoneId);
    const upcomingEvents: any[] = [];
    const today = new Date();

    schedules.forEach((schedule) => {
      // Calculate next 4 occurrences for each schedule
      for (let i = 0; i < 4; i++) {
        const eventDate = this.getNextOccurrence(schedule.pickupDay, i);
        upcomingEvents.push({
          id: `${schedule.id}-${i}`,
          date: eventDate.toISOString().split('T')[0],
          wasteCategory: schedule.wasteCategory,
          timeWindow: schedule.pickupTimeWindow,
        });
      }
    });

    // Sort by date and return
    return upcomingEvents.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 30);
  }

  private getNextOccurrence(pickupDay: number, weekOffset: number): Date {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    
    let daysUntil = pickupDay - dayOfWeek;
    
    // Implementation based on prompt logic adjusted for offsets
    let baseDaysUntil = pickupDay - dayOfWeek;
    if (baseDaysUntil <= 0) baseDaysUntil += 7;
    
    const next = new Date(today);
    next.setDate(today.getDate() + baseDaysUntil + (weekOffset * 7));
    next.setHours(0, 0, 0, 0);
    return next;
  }

  async createSchedule(dto: CreateScheduleInput) {
    return await scheduleRepository.createSchedule(dto);
  }

  async updateSchedule(id: string, dto: UpdateScheduleInput) {
    const schedule = await scheduleRepository.findScheduleById(id);
    if (!schedule) throw Errors.scheduleNotFound();
    return await scheduleRepository.updateSchedule(id, dto);
  }

  async deactivate(id: string) {
    const schedule = await scheduleRepository.findScheduleById(id);
    if (!schedule) throw Errors.scheduleNotFound();
    return await scheduleRepository.deactivateSchedule(id);
  }
}

export const scheduleService = new ScheduleService();
