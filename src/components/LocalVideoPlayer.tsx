import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

export interface LocalVideoPlayerHandle {
  play: () => void;
  pause: () => void;
}

interface LocalVideoPlayerProps {
  uri: string;
  isFullscreen: boolean;
  onFullscreenChange: (fullscreen: boolean) => void;
}

const LocalVideoPlayer = forwardRef<LocalVideoPlayerHandle, LocalVideoPlayerProps>(
  ({ uri, isFullscreen, onFullscreenChange }, ref) => {
    const player = useVideoPlayer(uri || '', (playerInstance) => {
      playerInstance.loop = false;
    });

    useImperativeHandle(ref, () => ({
      play: () => player.play(),
      pause: () => player.pause(),
    }));

    if (!uri) return null;

    return (
      <VideoView
        style={[styles.video, isFullscreen && styles.fullscreenVideo]}
        player={player}
        nativeControls
      />
    );
  }
);

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    height: '100%',
  },
});

export default LocalVideoPlayer;