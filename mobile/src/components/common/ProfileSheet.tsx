import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Dimensions, Pressable, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileSheetProps {
  visible: boolean;
  user: any;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({ visible, user, onClose, onLogout }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pan Responder for swipe-to-dismiss
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond if dragging downwards
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Close if dragged down far enough or fast enough
          closeSheet();
        } else {
          // Spring back to original position
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      pan.y.setValue(0);
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      pan.y.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const ProfileAction = ({ icon, title, subtitle, onPress, isDanger = false }: any) => (
    <TouchableOpacity 
      style={styles.actionRow} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.actionIconBox, { backgroundColor: isDanger ? '#FEF2F2' : '#F8FAFC' }]}>
        <Ionicons name={icon} size={20} color={isDanger ? '#EF4444' : '#475569'} />
      </View>
      <View style={styles.actionTextContent}>
        <Text style={[styles.actionTitle, isDanger && { color: '#EF4444' }]}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </Pressable>
        
        <Animated.View 
          style={[
            styles.sheet, 
            { 
              transform: [
                { translateY: slideAnim },
                { translateY: pan.y }
              ] 
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'A'}</Text>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user?.fullName || 'Administrator'}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                <Text style={styles.roleText}>SYSTEM ADMINISTRATOR</Text>
              </View>
            </View>
          </View>

          {/* Actions List */}
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
            
            <ProfileAction 
              icon="person-outline" 
              title="Personal Information" 
              subtitle="Manage your profile and bio" 
              onPress={() => {}}
            />
            <ProfileAction 
              icon="settings-outline" 
              title="App Preferences" 
              subtitle="Themes, notifications, and language" 
              onPress={() => {}}
            />
            <ProfileAction 
              icon="lock-closed-outline" 
              title="Security & Privacy" 
              subtitle="Password and authentication" 
              onPress={() => {}}
            />

            <View style={styles.divider} />
            
            <ProfileAction 
              icon="log-out-outline" 
              title="Sign Out" 
              subtitle="Safely log out of your session" 
              onPress={onLogout}
              isDanger={true}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Waste Optimizer v2.4.0 (Enterprise)</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  body: {
    padding: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  versionText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
