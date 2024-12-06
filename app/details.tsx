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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

const FINAL_SCALE = 0.6;
const END_TRANSLATE_Y = 100;

export default function Details() {
  const params = useLocalSearchParams<{
    diskPositionY: string;
  }>();

  const [isGoingBack, setIsGoingBack] = useState(false);

  const translateY = useSharedValueTransition({
    startValue: Number(params?.diskPositionY),
    endValue: END_TRANSLATE_Y,
    duration: 400,
    delay: 5,
    onEnd: () => {
      startRotation.value = true;
    },
  });

  const diskScale = useSharedValueTransition({
    startValue: 1,
    endValue: FINAL_SCALE,
    duration: 400,
    delay: 5,
  });

  const startRotation = useSharedValue(false);
  const musicRef = useRef<Audio.Sound>();
  const timeout = useRef<NodeJS.Timeout>();

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
        rotate:
          !isGoingBack && startRotation.value
            ? withRepeat(
                withTiming(360 + "deg", {
                  duration: 4000,
                  easing: Easing.linear,
                }),
                -1,
                false
              )
            : withSpring("0deg"),
      },
    ],
  }));

  async function playSound() {
    playSoundByDuration(startSound!, 1500);

    timeout.current = setTimeout(async () => {
      const { sound: music } = await Audio.Sound.createAsync(
        require("../assets/childhood.mp3"),
        { shouldPlay: true }
      );
      musicRef.current = music;
    }, 1500);
  }

  const stopAllSounds = () => {
    startSound?.stopAsync();
    musicRef.current?.stopAsync();
  };

  useFocusEffect(() => {
    stopAllSounds();
    playSound();

    return () => {
      clearTimeout(timeout.current);
      stopAllSounds();
    };
  });

  console.log(startSound);
  return (
    <SafeAreaView className="bg-[#292623] flex-1">
      <Pressable
        onPress={() => {
          setIsGoingBack(true);
          playSoundByDuration(endSound!, 600);
          diskScale.value = withSpring(1, { overshootClamping: true });
          translateY.value = withSpring(
            Number(params?.diskPositionY),
            { overshootClamping: true },
            () => {
              runOnJS(router.back)();
            }
          );
        }}
        className="m-4"
      >
        <Ionicons name="chevron-back" color="white" size={24} />
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
            marginTop: DISK_SIZE * FINAL_SCALE + END_TRANSLATE_Y,
          }}
        >
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
  );
}
