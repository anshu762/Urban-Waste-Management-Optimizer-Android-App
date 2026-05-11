import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseToastProps } from 'react-native-toast-message';

const iconMap: Record<string, { name: any; color: string; bg: string }> = {
  success: { name: 'checkmark-circle', color: '#059669', bg: '#D1FAE5' },
  error: { name: 'alert-circle', color: '#DC2626', bg: '#FEE2E2' },
  info: { name: 'information-circle', color: '#2563EB', bg: '#DBEAFE' },
};

const bgMap: Record<string, string> = {
  success: '#FFFFFF',
  error: '#FFFFFF',
  info: '#FFFFFF',
};

const accentMap: Record<string, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
};

export const premiumToastConfig = {
  success: (props: BaseToastProps) => <PremiumToast {...props} type="success" />,
  error: (props: BaseToastProps) => <PremiumToast {...props} type="error" />,
  info: (props: BaseToastProps) => <PremiumToast {...props} type="info" />,
};

const PremiumToast = ({ text1, text2, type, onPress }: BaseToastProps & { type: string }) => {
  const icon = iconMap[type] || iconMap.info;
  const bg = bgMap[type] || bgMap.info;
  const accent = accentMap[type] || accentMap.info;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title} numberOfLines={1}>{text1}</Text>
        {text2 ? <Text style={styles.message} numberOfLines={2}>{text2}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingLeft: 0,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    height: '100%',
    marginRight: 14,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 17,
    marginTop: 3,
  },
});
