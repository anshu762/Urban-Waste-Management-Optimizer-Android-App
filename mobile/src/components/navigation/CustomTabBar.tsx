import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_MAPPING: Record<string, keyof typeof Ionicons.glyphMap> = {
  AdminDashboard: 'grid-outline',
  ZoneManagement: 'location-outline',
  Complaints: 'alert-circle-outline',
  RouteManagement: 'map-outline',
  IoTDashboard: 'hardware-chip-outline',
  AnalyticsHome: 'bar-chart-outline',
  Home: 'home-outline',
  PickupCalendar: 'calendar-outline',
  LogWaste: 'leaf-outline',
  MyReports: 'document-text-outline',
  DriverHome: 'map-outline',
  DriverRoutes: 'list-outline',
  DriverNotifications: 'notifications-outline',
  DriverProfile: 'person-outline',
};

const ACTIVE_ICON_MAPPING: Record<string, keyof typeof Ionicons.glyphMap> = {
  AdminDashboard: 'grid',
  ZoneManagement: 'location',
  Complaints: 'alert-circle',
  RouteManagement: 'map',
  IoTDashboard: 'hardware-chip',
  AnalyticsHome: 'bar-chart',
  Home: 'home',
  PickupCalendar: 'calendar',
  LogWaste: 'leaf',
  MyReports: 'document-text',
  DriverHome: 'map',
  DriverRoutes: 'list',
  DriverNotifications: 'notifications',
  DriverProfile: 'person',
};

const ACTIVE_COLOR = '#10b981';
const INACTIVE_COLOR = '#94a3b8';

const TabItem = React.memo(({ route, index, isFocused, onPress, onLongPress }: {
  route: any; index: number; isFocused: boolean;
  onPress: () => void; onLongPress: () => void;
}) => {
  const scaleRef = useRef(new Animated.Value(1)).current;
  const translateYRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(translateYRef, {
        toValue: 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleRef, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateYRef, {
        toValue: -2,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleRef, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(translateYRef, {
        toValue: isFocused ? -3 : 0,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const iconName = isFocused
    ? (ACTIVE_ICON_MAPPING[route.name] || 'ellipse')
    : (ICON_MAPPING[route.name] || 'ellipse-outline');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View style={[
        styles.tabInner,
        {
          transform: [{ scale: scaleRef }, { translateY: translateYRef }],
        },
      ]}>
        <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
          <Ionicons
            name={iconName}
            size={22}
            color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: isFocused ? '#065f46' : INACTIVE_COLOR,
              fontWeight: isFocused ? '700' : '500',
              opacity: isFocused ? 1 : 0.7,
            },
          ]}
        >
          {route.name === 'LogWaste' ? 'Log Waste' : route.name.replace(/([A-Z])/g, ' $1').trim()}
        </Text>
        {isFocused && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
});

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
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
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#ecfdf5',
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
    marginTop: 3,
  },
});
