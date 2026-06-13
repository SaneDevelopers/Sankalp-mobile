import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
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

  const isTallScreen = screenAspectRatio < VIDEO_ASPECT_RATIO;
  const topGap = (SH - videoHeight) / 2;
  const leftGap = (SW - videoWidth) / 2;

  return (
    <ImageBackground
      source={require('../assets/images/sankalp_bg.jpg')}
      style={styles.container}
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

      {isTallScreen ? (
        <>
          {/* Top Edge Blend (Video top edge starts at topGap) */}
          <LinearGradient
            colors={['rgba(195, 175, 139, 0)', 'rgba(195, 175, 139, 1)', 'rgba(195, 175, 139, 0)']}
            style={[styles.blendTop, { top: topGap - 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Bottom Edge Blend (Video bottom edge ends at topGap + videoHeight) */}
          <LinearGradient
            colors={['rgba(204, 184, 155, 0)', 'rgba(204, 184, 155, 1)', 'rgba(204, 184, 155, 0)']}
            style={[styles.blendBottom, { top: topGap + videoHeight - 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </>
      ) : (
        <>
          {/* Left Edge Blend */}
          <LinearGradient
            colors={['rgba(202, 184, 152, 0)', 'rgba(202, 184, 152, 1)', 'rgba(202, 184, 152, 0)']}
            style={[styles.blendLeft, { left: leftGap - 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          {/* Right Edge Blend */}
          <LinearGradient
            colors={['rgba(202, 184, 152, 0)', 'rgba(202, 184, 152, 1)', 'rgba(202, 184, 152, 0)']}
            style={[styles.blendRight, { left: leftGap + videoWidth - 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#caba9c',
  },
  blendTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10,
  },
  blendBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10,
  },
  blendLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
  blendRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
});

