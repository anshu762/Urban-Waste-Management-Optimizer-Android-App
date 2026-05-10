import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { getUpcomingPickups } from '../../api/schedule.api';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import CategoryBadge from '../../components/common/CategoryBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';

export const PickupCalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const user = useAuthStore((state) => state.user);
  const zoneId = user?.residentProfile?.zoneId;

  const { data: pickups, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['upcomingPickups', zoneId],
    queryFn: () => getUpcomingPickups(zoneId!),
    enabled: !!zoneId,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getPickupsForDate = (date: Date) => {
    if (!pickups?.data) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return pickups.data.filter((p: any) => p.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const categoryColors: any = {
    WET: 'bg-green-500',
    DRY: 'bg-yellow-500',
    RECYCLABLE: 'bg-blue-500',
    HAZARDOUS: 'bg-red-500',
    SANITARY: 'bg-pink-500',
    EWASTE: 'bg-orange-500',
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 flex-row justify-between items-center border-b border-gray-100">
        <TouchableOpacity onPress={prevMonth}>
          <Text className="text-primary text-xl font-bold">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text className="text-primary text-xl font-bold">{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row py-2 border-b border-gray-50">
        {daysOfWeek.map((day) => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-gray-400 text-xs font-bold uppercase">{day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayPickups = getPickupsForDate(day);

          return (
            <TouchableOpacity
              key={day.toString()}
              onPress={() => setSelectedDate(day)}
              className={`w-[14.28%] h-20 border-b border-r border-gray-50 items-center justify-center ${
                !isCurrentMonth ? 'bg-gray-50 opacity-30' : ''
              } ${isSelected ? 'bg-primary/10' : ''}`}
            >
              <Text className={`text-base ${isToday ? 'text-primary font-bold' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </Text>
              
              <View className="flex-row mt-1 flex-wrap justify-center">
                {dayPickups.map((p: any, i: number) => (
                  <View 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full mx-0.5 ${categoryColors[p.wasteCategory] || 'bg-gray-400'}`} 
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView className="flex-1 bg-gray-50 p-4">
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : isError ? (
          <ErrorCard error={parseError(error)} onRetry={refetch} />
        ) : selectedDate ? (
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Pickups for {format(selectedDate, 'MMMM do')}
            </Text>
            {getPickupsForDate(selectedDate).length > 0 ? (
              getPickupsForDate(selectedDate).map((p: any, i: number) => (
                <View key={i} className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-100">
                  <View>
                    <Text className="font-bold text-gray-800">{p.wasteCategory}</Text>
                    <Text className="text-sm text-gray-500">Time: {p.timeWindow}</Text>
                  </View>
                  <CategoryBadge category={p.wasteCategory} />
                </View>
              ))
            ) : (
              <EmptyState emoji="📅" title="No pickups scheduled" subtitle="There are no pickups for this day." />
            )}
          </View>
        ) : (
          <EmptyState emoji="📅" title="Select a date" subtitle="Pickup details for your area will appear here." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
