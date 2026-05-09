import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
};

export const LoadingSkeleton = ({ width = '100%', height = 16, borderRadius = 8 }: Props) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        opacity,
        backgroundColor: '#E5E7EB',
      }}
    />
  );
};
