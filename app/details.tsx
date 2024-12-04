import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import { Audio } from "expo-av";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Text } from "react-native";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ITEM_SIZE = width * 0.7;
const SPACING = 32;

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

export default function Details() {
  const params = useLocalSearchParams<{
    diskPositionY: string;
  }>();

  const countdown = useSharedValue(Number(params?.diskPositionY));
  const startRotation = useSharedValue(false);
  const diskSound = useRef<Audio.Sound>();
  const musicRef = useRef<Audio.Sound>();
  const timeout = useRef<NodeJS.Timeout>();

  const diskStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: countdown.value,
      },
      { translateX: (ITEM_SIZE * 0.7 + SPACING) / 2 - 6 },
      {
        rotate: startRotation.value
          ? withRepeat(
              withTiming(360 + "deg", {
                duration: 4000,
                easing: Easing.linear,
              }),
              -1,
              false
            )
          : "0deg",
      },
    ],
  }));

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/audio.mp3"),
      { shouldPlay: true },
      () => {}
    );

    diskSound.current = sound;

    timeout.current = setTimeout(async () => {
      await sound.stopAsync();
      const { sound: music } = await Audio.Sound.createAsync(
        require("../assets/childhood.mp3"),
        { shouldPlay: true }
      );
      musicRef.current = music;
    }, 1500);
  }

  useEffect(() => {
    countdown.value = withDelay(
      50,
      withTiming(100, { duration: 400 }, () => {
        startRotation.value = true;
      })
    );
  }, []);

  useFocusEffect(() => {
    playSound();

    return () => {
      clearTimeout(timeout.current);
      diskSound.current?.stopAsync();
      musicRef.current?.stopAsync();
    };
  });

  return (
    <SafeAreaView className="bg-[#292623] flex-1">
      <Pressable
        onPress={() => {
          countdown.value = withSpring(
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
      <Animated.Image
        source={{
          uri: "https://i.pinimg.com/originals/52/d3/8b/52d38b4a6a2296d1ab78b485aaf16da6.png",
        }}
        style={[
          diskStyles,
          {
            width: ITEM_SIZE * 0.7,
            height: ITEM_SIZE * 0.7,
          },
        ]}
        className="rounded-full absolute"
      />
      <Animated.View
        entering={FadeInDown.delay(500)}
        style={{
          marginTop: ITEM_SIZE * 0.35 + 200,
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
    </SafeAreaView>
  );
}
