import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyComplaints } from '../../hooks/useComplaints';
import { useMyWasteLogs } from '../../hooks/useWasteLog';
import { StatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorCard } from '../../components/common/ErrorCard';
import { parseError } from '../../lib/error-parser';

const CATEGORY_EMOJI: Record<string, string> = {
  WET: '🟢', DRY: '🟡', RECYCLABLE: '♻️', SANITARY: '🩺', EWASTE: '💻', HAZARDOUS: '☣️',
};

export const MyReportsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'logs' | 'complaints'>('logs');

  const { data: complaintsData, isLoading: complaintsLoading, isError: complaintsError, error: complaintsErr, refetch: refetchComplaints, fetchNextPage: fetchMoreComplaints, hasNextPage: hasMoreComplaints } = useMyComplaints();
  const { data: logsData, isLoading: logsLoading, isError: logsError, error: logsErr, refetch: refetchLogs, fetchNextPage: fetchMoreLogs, hasNextPage: hasMoreLogs } = useMyWasteLogs();

  const complaints = complaintsData?.pages.flatMap((page) => page.data.data) || [];
  const wasteLogs = logsData?.pages.flatMap((page: any) => page.data?.data || page.data || []) || [];

  const isLoading = activeTab === 'logs' ? logsLoading : complaintsLoading;
  const isError = activeTab === 'logs' ? logsError : complaintsError;
  const error = activeTab === 'logs' ? logsErr : complaintsErr;
  const refetch = activeTab === 'logs' ? refetchLogs : refetchComplaints;

  const renderWasteLog = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <View className="bg-emerald-100 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 text-xs font-bold">♻️ WASTE LOG</Text>
        </View>
        <Text className="text-gray-400 text-xs">
          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
        </Text>
      </View>
      <View className="flex-row flex-wrap mb-2">
        {(item.wasteCategories || []).map((cat: string) => (
          <View key={cat} className="bg-gray-100 px-2 py-1 rounded-full mr-1 mb-1">
            <Text className="text-xs text-gray-700">{CATEGORY_EMOJI[cat] || '🗑️'} {cat}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center">
        <Text className="text-xs text-gray-500">
          {item.segregationStatus?.replace('_', ' ')} • {item.quantityEstimate || 'Qty not specified'}
        </Text>
      </View>
    </View>
  );

  const renderComplaint = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id, complaint: item })}
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row justify-between items-center"
    >
      <View className="flex-1 pr-4">
        <View className="flex-row items-center mb-1">
          <StatusBadge status={item.status} />
          <Text className="text-gray-400 text-xs ml-2">
            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text className="text-gray-800 text-sm" numberOfLines={2}>
          {item.note || 'No description provided'}
        </Text>
      </View>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100 px-4 pt-2">
        <TouchableOpacity
          onPress={() => setActiveTab('logs')}
          className={`mr-6 pb-3 border-b-2 ${
            activeTab === 'logs' ? 'border-emerald-500' : 'border-transparent'
          }`}
        >
          <Text className={`font-bold ${
            activeTab === 'logs' ? 'text-emerald-600' : 'text-gray-400'
          }`}>Waste Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('complaints')}
          className={`pb-3 border-b-2 ${
            activeTab === 'complaints' ? 'border-emerald-500' : 'border-transparent'
          }`}
        >
          <Text className={`font-bold ${
            activeTab === 'complaints' ? 'text-emerald-600' : 'text-gray-400'
          }`}>Complaints</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : isError ? (
        <ErrorCard error={parseError(error)} onRetry={() => refetch()} />
      ) : activeTab === 'logs' ? (
        <FlatList
          data={wasteLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderWasteLog}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <EmptyState emoji="✅" title="No reports yet" subtitle="Report a missed pickup if collection did not happen." />
          }
          onEndReached={() => { if (hasMoreLogs) fetchMoreLogs(); }}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaint}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <EmptyState emoji="✅" title="No complaints yet" subtitle="Report a missed pickup if collection did not happen." />
          }
          onEndReached={() => { if (hasMoreComplaints) fetchMoreComplaints(); }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};
