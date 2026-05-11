import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  baseColor?: string;
  highlightColor?: string;
  durationMs?: number;
};

export const LoadingSkeleton = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  baseColor = '#F1F5F9',
  highlightColor = '#E2E8F0',
  durationMs = 1100,
}: Props) => {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [durationMs, translateX]);

  return (
    <View style={[styles.container, { width: width as any, height, borderRadius, backgroundColor: baseColor }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            backgroundColor: highlightColor,
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-120, 320],
                }),
              },
              { skewX: '-20deg' },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 140,
    opacity: 0.65,
  },
});
