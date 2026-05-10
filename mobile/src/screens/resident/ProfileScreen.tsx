import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { updateProfileApi } from '../../api/user.api';
import { useAuthStore } from '../../stores/auth.store';
import { tokens } from '../../theme/tokens';
import { AuthPrimaryButton } from '../../components/auth/AuthPrimaryButton';

export const ProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.contact}>{user?.email || user?.mobile || 'No contact added'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          <Text style={styles.detailText}>Zone: {user?.residentProfile?.zoneId || 'Not assigned'}</Text>
          <Text style={[styles.detailText, { marginTop: 8 }]}>Building: {user?.residentProfile?.buildingName || 'Not set'}</Text>
          <Text style={[styles.detailText, { marginTop: 8 }]}>Block: {user?.residentProfile?.block || 'Not set'}</Text>
          <Text style={[styles.detailText, { marginTop: 8 }]}>Street: {user?.residentProfile?.street || 'Not set'}</Text>

          <View style={{ marginTop: 14 }}>
            <AuthPrimaryButton label="EDIT ADDRESS" onPress={() => navigation.navigate('AddressSetup')} />
          </View>
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.secondaryBtn} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isEditing} transparent animationType="slide" onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Edit Profile</Text>

            {(['buildingName', 'block', 'street'] as const).map((field) => (
              <View key={field} style={{ marginBottom: 12 }}>
                <Text style={styles.sheetLabel}>{field}</Text>
                <TextInput
                  value={form[field]}
                  onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))}
                  style={styles.sheetInput}
                  placeholderTextColor={tokens.colors.placeholder}
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
                <Text style={styles.sheetSaveText}>{updateMutation.isPending ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  profileCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  contact: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: tokens.colors.brandSoft,
    borderWidth: 1,
    borderColor: tokens.colors.brandBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.6,
  },
  sectionCard: {
    marginTop: 12,
    backgroundColor: tokens.colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: tokens.colors.text,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textMuted,
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: tokens.colors.text,
    letterSpacing: 0.4,
  },
  logoutBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 18,
    backgroundColor: tokens.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: tokens.colors.surface,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: tokens.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: tokens.colors.text,
    marginBottom: 12,
  },
  sheetLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: tokens.colors.textSubtle,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
  },
  sheetInput: {
    height: 54,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  sheetCancel: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '900',
    color: tokens.colors.textMuted,
  },
  sheetSave: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.text,
  },
  sheetSaveText: {
    fontSize: 14,
    fontWeight: '900',
    color: tokens.colors.surface,
    letterSpacing: 0.4,
  },
});
