import {
  DISK_COVER_SIZE,
  DISK_IMAGE_URL,
  DISK_SIZE,
} from "@/src/constants/constants";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  measure,
  runOnJS,
  runOnUI,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type MovieDiskProps = {
  index: number;
  isListStopped: boolean;
  scrollX: SharedValue<number>;
  title: string;
  year: number;
  coverImageUrl: string;
  onDiskPositionCalculated: (positions: { x: number; y: number }) => void;
};

export function MovieDisk({
  title,
  year,
  coverImageUrl,
  index,
  scrollX,
  isListStopped,
  onDiskPositionCalculated,
}: MovieDiskProps) {
  const diskRef = useAnimatedRef<View>();
  const isCurrentDiskFocused = scrollX.value === index;

  const stylez = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollX.value,
          [index - 1, index, index + 1],
          [0.8, 1, 0.8],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  console.log(scrollX.value);

  const cdStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(
          isCurrentDiskFocused && isListStopped ? -DISK_COVER_SIZE / 2 : 0
        ),
      },
    ],
  }));

  function calculateDiskPosition() {
    "worklet";
    try {
      const measures = measure(diskRef);
      runOnJS(onDiskPositionCalculated)({
        x: measures?.pageX!,
        y: measures?.pageY!,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View>
      <Animated.View
        style={[
          {
            width: DISK_COVER_SIZE,
            height: DISK_COVER_SIZE,
          },
          stylez,
        ]}
        className="items-center justify-center"
      >
        <Animated.View ref={diskRef}>
          <Image
            onLayout={runOnUI(calculateDiskPosition)}
            source={{
              uri: coverImageUrl,
            }}
            style={[
              {
                width: DISK_COVER_SIZE,
                height: DISK_COVER_SIZE,
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          className="absolute"
          style={{
            transform: [
              {
                translateY: DISK_COVER_SIZE / 2 + 32,
              },
            ],
          }}
        >
          <Text className="text-lg font-bold text-white text-center mt-4 mb-2">
            {title}
          </Text>
          <Text className="text-md text-white text-center">{year}</Text>
        </Animated.View>
        <Animated.View style={[cdStyles, { zIndex: -1, position: "absolute" }]}>
          <Image
            source={{
              uri: DISK_IMAGE_URL,
            }}
            style={[
              {
                width: DISK_SIZE,
                height: DISK_SIZE,
              },
            ]}
            className="rounded-full"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}