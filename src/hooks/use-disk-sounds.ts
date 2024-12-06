import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { useEffect, useRef, useState } from "react";

export function useDiskSounds() {
  const [startSound, setStartSound] = useState<Sound | null>();
  const [endSound, setEndSound] = useState<Sound | null>();

  useEffect(() => {
    const createSounds = async () => {
      const { sound: startSound } = await Audio.Sound.createAsync(
        require("../../assets/vinil.mp3")
      );

      const { sound: endSound } = await Audio.Sound.createAsync(
        require("../../assets/audio.mp3"),
        {
          positionMillis: 1000,
          seekMillisToleranceAfter: 1000,
        }
      );

      setStartSound(startSound);
      setEndSound(endSound);
    };

    createSounds();
  }, []);

  return {
    startSound,
    endSound,
  };
}
