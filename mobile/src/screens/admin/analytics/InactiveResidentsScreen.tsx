import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { analyticsApi } from '../../../api/analytics.api';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  InactiveResidents: { zoneId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'InactiveResidents'>;

export const InactiveResidentsScreen: React.FC<any> = ({ route }) => {
  const { zoneId } = route.params;
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inactiveResidents', zoneId],
    queryFn: () => analyticsApi.getInactiveResidents(zoneId),
  });

  const handleSendReminder = async () => {
    if (!data || data.residents.length === 0) return;

    Alert.alert(
      "Send Bulk Reminder",
      `Are you sure you want to send a push notification to ${data.residents.length} inactive residents?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send", 
          onPress: async () => {
            setSending(true);
            try {
              const userIds = data.residents.map(r => r.userId);
              await analyticsApi.sendBulkNotification(
                userIds, 
                "We miss you! 🗑️", 
                "Hi! Don't forget to log your waste before pickup day to keep our city clean."
              );
              Alert.alert("Success", `Reminder sent to ${userIds.length} residents`);
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message || err.message || "Failed to send reminders");
            } finally {
              setSending(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Fetching User Data...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const isVeryInactive = item.daysSinceLastLog >= 14;

    return (
      <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-full justify-center items-center ${isVeryInactive ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <Ionicons name="person" size={20} color={isVeryInactive ? '#dc2626' : '#d97706'} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800 text-base truncate" numberOfLines={1}>{item.fullName}</Text>
            <Text className="text-gray-500 text-sm">
              {item.lastLogDate 
                ? `Last logged ${item.daysSinceLastLog} days ago` 
                : 'Never logged waste'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const activeRatio = data ? ((data.totalResidents - data.totalInactive) / data.totalResidents) * 100 : 0;
  const inactiveRatio = data ? (data.totalInactive / data.totalResidents) * 100 : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Inactive Residents</Text>
        
        <Text className="text-gray-600 mb-3">
          <Text className="font-bold text-gray-800">{data?.totalInactive}</Text> out of {data?.totalResidents} residents inactive ({data?.percentage}%)
        </Text>

        <View className="h-3 w-full bg-gray-100 rounded-full flex-row overflow-hidden">
          <View style={{ width: `${activeRatio}%` }} className="bg-green-500 h-full" />
          <View style={{ width: `${inactiveRatio}%` }} className="bg-red-400 h-full" />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-400">Active</Text>
          <Text className="text-xs text-gray-400">Inactive</Text>
        </View>
      </View>

      <FlatList
        data={data?.residents}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text className="text-gray-500 mt-4 font-bold text-lg">Everyone is active!</Text>
          </View>
        }
      />

      {/* Floating Action Button for Bulk Send */}
      {data?.residents && data.residents.length > 0 && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity 
            onPress={handleSendReminder}
            disabled={sending}
            className={`py-4 rounded-xl shadow-lg flex-row justify-center items-center ${sending ? 'bg-purple-400' : 'bg-purple-600'}`}
          >
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Send Bulk Reminder ({data.residents.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 }
});

export default InactiveResidentsScreen;
