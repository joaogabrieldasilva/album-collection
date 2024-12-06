import { MovieDisk } from "@/src/components/movie-disk/movie-disk";
import {
  DISK_COVER_SIZE,
  DISK_GAP,
  DISK_SPACING,
} from "@/src/constants/constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

const albums = [
  {
    title: "Beach House",
    year: 2006,
    coverImage: "https://f4.bcbits.com/img/a1751756132_10.jpg",
  },
  {
    title: "Devotion",
    year: 2008,
    coverImage:
      "data:image/jpeg;base64,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",
  },
  {
    title: "Teen Dream",
    year: 2010,
    coverImage:
      "https://media.pitchfork.com/photos/5929a80313d1975652139561/master/pass/20945b0e.jpg",
  },
  {
    title: "Bloom",
    year: 2012,
    coverImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5jd2OvcH-I3RmJY74zuy5agRFQCkcE4Mo5g&s",
  },
  {
    title: "Depression Cherry",
    year: 2015,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/Beach_House_-_Depression_Cherry.png",
  },
  {
    title: "Thank Your Lucky Stars",
    year: 2015,
    coverImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT86cjUiDT8AK2_wQjrA8Spf3mIXih6Sg-YoA&s",
  },
  {
    title: "7",
    year: 2018,
    coverImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxqEirfUBQy7VGml38qc_bLTFdJQ9_sZ7EJA&s",
  },
  {
    title: "Once Twice Melody",
    year: 2022,
    coverImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5fArIEsi7Tq2BjqfHzCf6y3u0il1PyWkGaQ&s",
  },
];

export default function Index() {
  const scrollX = useSharedValue(0);

  const [isListStopped, setIsListStopped] = useState(true);
  const [diskYPosition, setDiskYPosition] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x / (DISK_COVER_SIZE + DISK_SPACING / 2);

      console.log(scrollX.value);
    },
    onMomentumEnd: () => {
      runOnJS(setIsListStopped)(true);
    },
    onMomentumBegin: () => {
      runOnJS(setIsListStopped)(false);
    },
  });

  return (
    <LinearGradient
      colors={["#3e3e3e", "#060606"]}
      style={{
        flex: 1,
      }}
    >
      <StatusBar style="light" />
      <Animated.FlatList
        data={albums}
        horizontal
        keyExtractor={(_, index) => String(index)}
        contentContainerClassName="items-center"
        contentContainerStyle={{
          gap: DISK_GAP,
          paddingHorizontal: DISK_SPACING * 2,
        }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsHorizontalScrollIndicator={false}
        snapToInterval={DISK_COVER_SIZE + DISK_SPACING - DISK_GAP}
        decelerationRate="fast"
        renderItem={({ item, index }) => {
          return (
            <Pressable
              onPress={() => {
                router.navigate({
                  pathname: "/details",
                  params: {
                    diskPositionY: diskYPosition,
                  },
                });
              }}
            >
              <MovieDisk
                onDiskPositionCalculated={({ y }) =>
                  setDiskYPosition(y - DISK_COVER_SIZE / 2 + 16)
                }
                isListStopped={isListStopped}
                scrollX={scrollX}
                index={index}
                title={item.title}
                year={item.year}
                coverImageUrl={item.coverImage}
              />
            </Pressable>
          );
        }}
      />
    </LinearGradient>
  );
}
