import { useEffect } from "react";
import {
  runOnJS,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type Params = {
  startValue: number;
  endValue: number;
  duration?: number;
  delay?: number;
  onEnd?: () => void;
};

export function useSharedValueTransition({
  startValue,
  endValue,
  duration = 1000,
  delay = 0,
  onEnd,
}: Params) {
  const value = useSharedValue(startValue);

  useEffect(() => {
    value.value = withDelay(
      delay,
      withTiming(endValue, { duration }, () => {
        if (onEnd) {
          runOnJS(onEnd)();
        }
      })
    );
  }, []);

  return value;
}
