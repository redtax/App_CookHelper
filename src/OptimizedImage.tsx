import React, { useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  StyleProp,
  ImageStyle,
} from 'react-native';
import { imageCacheManager } from './ImageCacheManager';
import imageMap from './imageMap';

interface OptimizedImageProps {
  source: { uri: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const resolvedSource = useMemo(() => {
    if (!source.uri) return null;
    if (imageMap[source.uri]) {
      return imageMap[source.uri];
    }
    return { uri: source.uri };
  }, [source.uri]);

  if (!resolvedSource) {
    return null;
  }

  const handleLoadStart = () => {
    setLoading(true);
    if (source.uri) {
      imageCacheManager.loadImage(source.uri);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : null}
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🖼️</Text>
          <Text style={styles.errorText}>图片加载失败</Text>
        </View>
      ) : null}
      <Image
        source={resolvedSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
  },
});

export default OptimizedImage;