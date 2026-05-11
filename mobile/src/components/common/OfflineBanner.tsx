import React, { useEffect, useState } from 'react';
import { View, Text, Animated, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [animation] = useState(new Animated.Value(-100)); // Start hidden

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      
      if (state.isConnected === false) {
        // Show banner
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 20,
          friction: 7,
        }).start();
      } else if (state.isConnected === true) {
        // Hide banner
        Animated.timing(animation, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => unsubscribe();
  }, []);

  if (isConnected === null) return null;

  return (
    <Animated.View 
      style={{ 
        transform: [{ translateY: animation }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <SafeAreaView className="bg-yellow-400">
        <View className="py-2 px-4 flex-row justify-center items-center">
          <Text className="text-yellow-900 font-bold text-sm">
            📡 No internet connection
          </Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};
