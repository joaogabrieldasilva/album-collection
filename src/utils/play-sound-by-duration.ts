import { Sound } from "expo-av/build/Audio";

export function playSoundByDuration(sound: Sound, duration: number) {
  sound?.playAsync();

  if (duration) {
    setTimeout(() => {
      sound?.stopAsync();
    }, duration);
  }
}
