import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';

interface KuaishouPlayerProps {
  videoId: string | null;
  originalUrl?: string | null;
}

const KuaishouPlayer: React.FC<KuaishouPlayerProps> = ({ videoId, originalUrl }) => {
  const handleOpenInBrowser = () => {
    const url = originalUrl || videoId || '';
    if (!url) {
      Alert.alert('提示', '没有可用的视频链接');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('提示', '无法打开链接，请检查网络连接');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>快手视频暂不支持内嵌播放</Text>
      <TouchableOpacity style={styles.button} onPress={handleOpenInBrowser}>
        <Text style={styles.buttonText}>打开观看</Text>
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
  },
  infoText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default KuaishouPlayer;