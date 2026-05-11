import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth.store';
import { useDriverProfile, useTodayRoute } from '../../hooks/useDriver';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const DriverProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const { data: profileData, isLoading } = useDriverProfile();
  const { data: todayRouteData } = useTodayRoute();
  const driverProfile = profileData?.data?.driverProfile;

  const todayPlan = todayRouteData?.data?.[0];
  const vehicle = todayPlan?.vehicle;
  const stops = todayPlan?.routeStops || [];
  const todayStats = {
    completed: stops.filter((s: any) => s.stopStatus === 'COMPLETED').length,
    skipped: stops.filter((s: any) => s.stopStatus === 'SKIPPED').length,
    total: stops.length,
  };

  const ProfileRow = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <View style={styles.profileRow}>
      <View style={styles.profileIconBox}>
        <Ionicons name={icon} size={18} color="#475569" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileLabel}>{label}</Text>
        <Text style={styles.profileValue}>{value || '---'}</Text>
      </View>
    </View>
  );

  const StatTile = ({
    icon,
    value,
    label,
    color,
    bg,
  }: {
    icon: any;
    value: string | number;
    label: string;
    color: string;
    bg: string;
  }) => (
    <View style={[styles.statTile, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{user?.fullName?.charAt(0) || 'D'}</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.driverName}>{user?.fullName || 'Driver'}</Text>
          <View style={styles.rolePill}>
            <Ionicons name="car-sport" size={12} color="#10B981" />
            <Text style={styles.roleText}>COLLECTION DRIVER</Text>
          </View>
        </View>

        {/* Today's Stats */}
        <Text style={styles.sectionTitle}>TODAY'S PERFORMANCE</Text>
        <View style={styles.statsRow}>
          <StatTile
            icon="checkmark-circle"
            value={todayStats.completed}
            label="Completed"
            color="#059669"
            bg="#ECFDF5"
          />
          <StatTile
            icon="close-circle"
            value={todayStats.skipped}
            label="Skipped"
            color="#DC2626"
            bg="#FEF2F2"
          />
          <StatTile
            icon="flag"
            value={todayStats.total}
            label="Total Stops"
            color="#2563EB"
            bg="#EFF6FF"
          />
        </View>

        {/* Profile Details */}
        <Text style={styles.sectionTitle}>ACCOUNT INFO</Text>
        <View style={styles.detailsCard}>
          <ProfileRow icon="person-outline" label="Full Name" value={user?.fullName || ''} />
          <View style={styles.divider} />
          <ProfileRow icon="call-outline" label="Mobile" value={user?.mobile || ''} />
          <View style={styles.divider} />
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || ''} />
        </View>

        {/* Vehicle Info */}
        <Text style={styles.sectionTitle}>ASSIGNED VEHICLE</Text>
        {isLoading ? (
          <View style={styles.detailsCard}>
            <LoadingSkeleton height={60} borderRadius={16} />
          </View>
        ) : vehicle ? (
          <View style={styles.detailsCard}>
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIconBox}>
                <Ionicons name="bus" size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleNumber}>{vehicle.vehicleNumber}</Text>
                <Text style={styles.vehicleCapacity}>
                  Capacity: {vehicle.capacityUnits || 'N/A'} units
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.detailsCard}>
            <Text style={styles.noVehicleText}>No vehicle assigned</Text>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={logoutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to log out? You will need to sign in again."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        isDanger
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 32 },
  avatarSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigAvatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  noVehicleText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
});

export default DriverProfileScreen;
