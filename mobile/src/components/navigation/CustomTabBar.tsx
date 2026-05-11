import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_MAPPING: Record<string, keyof typeof Ionicons.glyphMap> = {
  // Admin Tabs
  AdminDashboard: 'grid-outline',
  ZoneManagement: 'location-outline',
  Complaints: 'alert-circle-outline',
  RouteManagement: 'map-outline',
  IoTDashboard: 'hardware-chip-outline',
  AnalyticsHome: 'bar-chart-outline',
  
  // Resident Tabs
  Home: 'home-outline',
  PickupCalendar: 'calendar-outline',
  LogWaste: 'leaf-outline',
  MyReports: 'document-text-outline',

  // Driver Tabs
  DriverHome: 'map-outline',
  DriverRoutes: 'list-outline',
  DriverNotifications: 'notifications-outline',
  DriverProfile: 'person-outline',
};

const ACTIVE_ICON_MAPPING: Record<string, keyof typeof Ionicons.glyphMap> = {
  // Admin Tabs
  AdminDashboard: 'grid',
  ZoneManagement: 'location',
  Complaints: 'alert-circle',
  RouteManagement: 'map',
  IoTDashboard: 'hardware-chip',
  AnalyticsHome: 'bar-chart',
  
  // Resident Tabs
  Home: 'home',
  PickupCalendar: 'calendar',
  LogWaste: 'leaf',
  MyReports: 'document-text',

  // Driver Tabs
  DriverHome: 'map',
  DriverRoutes: 'list',
  DriverNotifications: 'notifications',
  DriverProfile: 'person',
};

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = isFocused 
            ? ACTIVE_ICON_MAPPING[route.name] || 'ellipse'
            : ICON_MAPPING[route.name] || 'ellipse-outline';

          const activeColor = '#10b981'; // Emerald 500
          const inactiveColor = '#94a3b8'; // Slate 400

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? activeColor : inactiveColor} 
                />
              </View>
              <Text 
                numberOfLines={1}
                style={[
                  styles.label, 
                  { color: isFocused ? '#064e3b' : inactiveColor, fontWeight: isFocused ? '700' : '500' }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    // No position: absolute - this makes it "stick" naturally
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
