import {
  DISK_IMAGE_URL,
  DISK_SIZE,
  DISK_SPACING,
} from "@/src/constants/constants";
import { useDiskSounds } from "@/src/hooks/use-disk-sounds";
import { useSharedValueTransition } from "@/src/hooks/use-shared-value-transition";
import { playSoundByDuration } from "@/src/utils/play-sound-by-duration";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  clamp,
  Easing,
  Extrapolation,
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { formatSecondsToClockTime } from "@/src/utils/format-seconds-to-clock-time";

const songs = [
  "Steel Song",
  "Seventeen",
  "Apple Orchard",
  "Loftus",
  "Master of None",
  "Saltwater",
  "Summer Song",
  "Childhood",
  "Auburn and Ivory",
  "Home Again",
];

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const { width } = Dimensions.get("window");

console.log("WIDTH", width, width * 0.9);

const FINAL_SCALE = 0.6;
const END_TRANSLATE_Y = 120;

const PROGRESS_BAR_SIZE = width * 0.9;

export default function Details() {
  const params = useLocalSearchParams<{
    diskPositionY: string;
    albumTitle: string;
  }>();

  const albumTitle = params?.albumTitle;

  const [isGoingBack, setIsGoingBack] = useState(false);

  const translateY = useSharedValueTransition({
    startValue: Number(params?.diskPositionY),
    endValue: END_TRANSLATE_Y,
    duration: 200,
    delay: 5,
  });

  const diskScale = useSharedValueTransition({
    startValue: 1,
    endValue: FINAL_SCALE,
    duration: 200,
    delay: 5,
  });

  const musicRef = useRef<Audio.Sound>();
  const timeout = useRef<NodeJS.Timeout>();

  const maxDuration = useSharedValue(0);
  const duration = useSharedValue(0);

  const [isPlaying, setIsPlaying] = useState(true);

  const { startSound, endSound } = useDiskSounds();

  const diskStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: diskScale.value,
      },
      {
        translateY: translateY.value,
      },
      {
        translateX: (DISK_SIZE / diskScale.value + DISK_SPACING) / 2 - 6,
      },
      {
        rotate: `${interpolate(
          duration.value,
          [0, maxDuration.value / 60],
          [0, 360]
        )}deg`,
      },
    ],
  }));

  const animatedBarStyles = useAnimatedStyle(() => ({
    width:
      duration.value && maxDuration.value
        ? PROGRESS_BAR_SIZE * (duration.value / maxDuration.value)
        : 0,
  }));

  async function playSound() {
    playSoundByDuration(startSound!, 1500);

    timeout.current = setTimeout(async () => {
      const { sound: music, status } = await Audio.Sound.createAsync(
        require("../assets/childhood.mp3"),
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            duration.value = status.positionMillis;
          }
        }
      );
      if (status.isLoaded) {
        maxDuration.value = status.durationMillis || 0;
      }

      music.setProgressUpdateIntervalAsync(16);

      musicRef.current = music;
    }, 1500);
  }

  const stopAllSounds = () => {
    startSound?.stopAsync();
    musicRef.current?.stopAsync();
  };

  useEffect(() => {
    stopAllSounds();
    playSound();

    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  const durationTextProps = useAnimatedProps(() => {
    const seconds = Math.ceil(duration.value / 1000);

    const value = formatSecondsToClockTime(seconds);
    return {
      text: value,
      defaultValue: value,
    };
  });

  const maxDurationTextProps = useAnimatedProps(() => {
    const value = `-${formatSecondsToClockTime(
      Math.floor((maxDuration.value - duration.value) / 1000)
    )}`;
    return {
      text: value,
      defaultValue: value,
    };
  });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      musicRef.current?.pauseAsync();
    })
    .onEnd(() => {
      musicRef.current?.playFromPositionAsync(Math.max(0, duration.value));
    })
    .onUpdate(({ x }) => {
      "worklet";
      duration.value = clamp(
        (x / PROGRESS_BAR_SIZE) * maxDuration.value,
        0,
        maxDuration.value
      );
    })
    .runOnJS(true);

  return (
    <LinearGradient
      colors={["#3e3e3e", "#060606"]}
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView className="flex-1">
        <Pressable
          onPress={() => {
            setIsGoingBack(true);
            playSoundByDuration(endSound!, 600);
            duration.value = withTiming(0, { duration: 1000 });
            maxDuration.value = withTiming(0, { duration: 1000 }, () => {
              runOnJS(stopAllSounds)();
            });

            diskScale.value = withSpring(1, { overshootClamping: true });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            translateY.value = withSpring(
              Number(params?.diskPositionY),
              { overshootClamping: true },
              () => {
                runOnJS(router.back)();
              }
            );
          }}
          className="m-4 flex-row items-center"
        >
          <Ionicons
            name="chevron-back"
            color="white"
            size={24}
            style={{ flex: 1 }}
          />
          <Text className="text-center text-white font-bold text-lg flex-1">
            {albumTitle}
          </Text>
          <View className="flex-1" />
        </Pressable>
        <Animated.View style={[diskStyles, { position: "absolute" }]}>
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

        {!isGoingBack ? (
          <Animated.View
            entering={FadeInDown.delay(500)}
            exiting={FadeOutDown}
            style={{
              marginTop: DISK_SIZE * FINAL_SCALE + 32,
            }}
          >
            <GestureDetector gesture={panGesture}>
              <View className="bg-[#222] w-[90%] self-center h-2 rounded-full mb-4">
                <Animated.View
                  style={animatedBarStyles}
                  className="h-2 bg-white rounded-full items-end justify-center"
                >
                  <Animated.View
                    className="size-4 bg-white rounded-full translate-x-2"
                    hitSlop={40}
                  />
                </Animated.View>
              </View>
            </GestureDetector>
            <View className="w-[90%] flex-row self-center items-center justify-between mb-4">
              <AnimatedTextInput
                editable={false}
                className="text-white text-xs font-bold"
                animatedProps={durationTextProps}
              />
              <AnimatedTextInput
                editable={false}
                className="text-white text-xs font-bold"
                animatedProps={maxDurationTextProps}
              />
            </View>
            <View className="flex-row items-center self-center mb-8 mt-4 gap-4">
              <Pressable
                className="size-12 rounded-full items-center justify-center"
                onPress={() => {
                  musicRef.current?.replayAsync();
                }}
              >
                <Ionicons name="play-skip-back" size={20} color="white" />
              </Pressable>
              <Pressable
                className="bg-white size-16 rounded-full items-center justify-center"
                onPress={() => {
                  if (isPlaying) {
                    musicRef.current?.pauseAsync();
                    setIsPlaying(false);
                  } else {
                    musicRef.current?.playFromPositionAsync(duration.value);
                    setIsPlaying(true);
                  }
                }}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} />
              </Pressable>
              <Pressable
                className=" size-12 rounded-full items-center justify-center"
                onPress={() => {
                  musicRef.current?.stopAsync();
                  setIsPlaying(false);
                }}
              >
                <Ionicons name="play-skip-forward" size={20} color="white" />
              </Pressable>
            </View>
            <FlatList
              data={songs}
              contentContainerClassName="items-center gap-4"
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <View>
                  <Text
                    className={`font-bold text-xl ${
                      index === 7 ? "text-white" : "text-[#47423b]"
                    }`}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          </Animated.View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
