import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export const useSafeAreaColor = (setSafeAreaColor, color) => {
  useFocusEffect(
    useCallback(() => {
      setSafeAreaColor?.(color);
    }, [color, setSafeAreaColor]),
  );
};
