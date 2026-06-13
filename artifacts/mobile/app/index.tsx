import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { router } from 'expo-router';
import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';

// Video dimensions
const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 848;
const VIDEO_ASPECT_RATIO = VIDEO_WIDTH / VIDEO_HEIGHT;

export default function SplashScreen() {
  const videoRef = useRef<Video>(null);
  const { width: SW, height: SH } = useWindowDimensions();

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      navigateAway();
    }
  }, []);

  const navigateAway = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('@sankalp:onboarded');
      if (onboarded) {
        router.replace('/(tabs)');
      } else {
        await AsyncStorage.setItem('@sankalp:onboarded', 'true');
        router.replace('/onboarding' as any);
      }
    } catch {
      router.replace('/(tabs)');
    }
  };

  // Calculate scaled dimensions to fit the screen size perfectly
  const screenAspectRatio = SW / SH;
  let videoWidth = SW;
  let videoHeight = SH;

  if (screenAspectRatio < VIDEO_ASPECT_RATIO) {
    // Screen is taller/narrower than the video (e.g. standard/tall phones)
    // Fit to screen width
    videoWidth = SW;
    videoHeight = SW / VIDEO_ASPECT_RATIO;
  } else {
    // Screen is wider/shorter than the video (e.g. tablets/iPads)
    // Fit to screen height
    videoHeight = SH;
    videoWidth = SH * VIDEO_ASPECT_RATIO;
  }

  return (
    <ImageBackground
      source={require('../assets/images/sankalp_logo.jpg')}
      style={styles.container}
      blurRadius={20}
      resizeMode="cover"
    >
      <Video
        ref={videoRef}
        source={require('../assets/splashscreen.mp4')}
        style={{
          width: videoWidth,
          height: videoHeight,
        }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF3E8',
  },
});

