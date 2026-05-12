import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { updateProfileApi } from '../../api/user.api';
import { useAuthStore } from '../../stores/auth.store';
import { tokens } from '../../theme/tokens';
import { SwipeableBottomSheet } from '../../components/common/SwipeableBottomSheet';

export const ProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    buildingName: user?.residentProfile?.buildingName || '',
    block: user?.residentProfile?.block || '',
    street: user?.residentProfile?.street || '',
  });

  const updateMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => setIsEditing(false),
  });

  const rp = user?.residentProfile;

  const ProfileRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{user?.fullName?.charAt(0) || 'R'}</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Resident'}</Text>
          <View style={styles.rolePill}>
            <Ionicons name="home" size={12} color="#10B981" />
            <Text style={styles.roleText}>RESIDENT</Text>
          </View>
        </View>

        {/* Contact Info */}
        <Text style={styles.sectionTitle}>CONTACT</Text>
        <View style={styles.detailsCard}>
          <ProfileRow icon="person-outline" label="Full Name" value={user?.fullName || ''} />
          <View style={styles.divider} />
          <ProfileRow icon="call-outline" label="Mobile" value={user?.mobile || ''} />
          <View style={styles.divider} />
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || ''} />
        </View>

        {/* Address Info */}
        <Text style={styles.sectionTitle}>ADDRESS</Text>
        <View style={styles.detailsCard}>
          <ProfileRow icon="location-outline" label="Zone" value={rp?.zone?.zoneName || rp?.zoneId || 'Not assigned'} />
          <View style={styles.divider} />
          <ProfileRow icon="business-outline" label="Building" value={rp?.buildingName || 'Not set'} />
          <View style={styles.divider} />
          <ProfileRow icon="layers-outline" label="Block" value={rp?.block || 'Not set'} />
          <View style={styles.divider} />
          <ProfileRow icon="map-outline" label="Street" value={rp?.street || 'Not set'} />

          <TouchableOpacity style={styles.editAddressBtn} onPress={() => navigation.navigate('AddressSetup')} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={16} color="#10B981" />
            <Text style={styles.editAddressText}>Change Address</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile */}
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={18} color="#0F172A" />
          <Text style={styles.editProfileText}>Edit Profile Details</Text>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SwipeableBottomSheet visible={isEditing} onClose={() => setIsEditing(false)}>
        <Text style={styles.sheetTitle}>Edit Profile</Text>

        {(['buildingName', 'block', 'street'] as const).map((field) => (
          <View key={field} style={{ marginBottom: 14, paddingHorizontal: 24 }}>
            <Text style={styles.sheetLabel}>{field.replace(/([A-Z])/g, ' $1').trim()}</Text>
            <TextInput
              value={form[field]}
              onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
              style={styles.sheetInput}
              placeholderTextColor={tokens.colors.placeholder}
              placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            />
          </View>
        ))}

        <View style={styles.sheetFooter}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.sheetCancel} activeOpacity={0.75}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateMutation.mutate(form)}
            style={styles.sheetSave}
            activeOpacity={0.85}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sheetSaveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SwipeableBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
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
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
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
  editAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  editAddressText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  editProfileText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  sheetInput: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  sheetCancel: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  sheetSave: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetSaveText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
