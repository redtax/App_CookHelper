import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { extractBVId } from '../utils/videoUtils';

interface BilibiliPlayerProps {
  embedUrl: string | null;
  originalUrl: string | null;
  isFullscreen?: boolean;
  onBvIdExtracted?: (embedUrl: string) => void;
}

async function resolveB23TvToBvId(shortUrl: string): Promise<string | null> {
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual',
    });
    const location = response.headers.get('location');
    if (location) {
      const bvId = extractBVId(location);
      if (bvId) return bvId;
    }
  } catch {
  }

  try {
    const response = await fetch(shortUrl, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (location) {
      const bvId = extractBVId(location);
      if (bvId) return bvId;
    }
  } catch {
  }

  return null;
}

async function openBilibiliVideo(originalUrl: string | null, embedUrl: string | null) {
  const webUrl = originalUrl || embedUrl || '';
  if (!webUrl) {
    Alert.alert('提示', '没有可用的视频链接');
    return;
  }

  let bvId = extractBVId(webUrl);

  if (bvId) {
    await Linking.openURL(`bilibili://video/${bvId}`).catch(() => {
      Linking.openURL(`https://www.bilibili.com/video/${bvId}`).catch(() => {
        Alert.alert('提示', '无法打开链接，请检查是否安装了哔哩哔哩客户端');
      });
    });
    return;
  }

  const resolved = await resolveB23TvToBvId(webUrl);
  if (resolved) {
    await Linking.openURL(`bilibili://video/${resolved}`).catch(() => {
      Linking.openURL(`https://www.bilibili.com/video/${resolved}`).catch(() => {});
    });
    return;
  }

  try {
    await Linking.openURL(webUrl);
  } catch {
    Alert.alert('提示', '无法打开链接，请检查网络连接');
  }
}

const BilibiliPlayer: React.FC<BilibiliPlayerProps> = ({ embedUrl, originalUrl }) => {
  const [resolving, setResolving] = useState(false);

  const handlePress = async () => {
    const webUrl = originalUrl || embedUrl || '';
    if (!webUrl) {
      Alert.alert('提示', '没有可用的视频链接');
      return;
    }

    const bvId = extractBVId(webUrl);

    if (bvId) {
      await openBilibiliVideo(originalUrl, embedUrl);
      return;
    }

    setResolving(true);
    await openBilibiliVideo(originalUrl, embedUrl);
    setResolving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>B站视频</Text>
      <Text style={styles.infoText}>
        直接唤起哔哩哔哩客户端播放{'\n'}无需经过浏览器
      </Text>
      <TouchableOpacity
        style={[styles.button, resolving && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={resolving}
      >
        {resolving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>打开观看</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#999',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#fb7299',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BilibiliPlayer;