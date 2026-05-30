import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  FlatList,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context';
import { parseVideoUrl } from '../utils/videoUtils';
import { Recipe } from '../types';
import LocalVideoPlayer, { LocalVideoPlayerHandle } from '../components/LocalVideoPlayer';
import BilibiliPlayer from '../components/BilibiliPlayer';
import KuaishouPlayer from '../components/KuaishouPlayer';

const VideoPlayerScreen = ({ navigation, route }: any) => {
  const { recipes, updateRecipe, markRecipeAsModified } = useApp();
  const initialRecipe: Recipe = route?.params?.recipe;
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(initialRecipe);

  const localPlayerRef = useRef<LocalVideoPlayerHandle>(null);

  const [sourceType, setSourceType] = useState<'none' | 'local' | 'bilibili' | 'kuaishou'>('none');
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [networkUrl, setNetworkUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const saveVideoUrlWithConfirm = useCallback(
    (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!currentRecipe) {
          resolve(false);
          return;
        }
        Alert.alert(
          '保存视频链接',
          `将当前视频链接保存到菜品「${currentRecipe.name}」？`,
          [
            { text: '取消', style: 'cancel', onPress: () => resolve(false) },
            {
              text: '确认保存',
              onPress: () => {
                const updated = { ...currentRecipe, videoUrl: url };
                updateRecipe(updated);
                markRecipeAsModified(currentRecipe.id);
                resolve(true);
              },
            },
          ],
        );
      });
    },
    [currentRecipe, updateRecipe, markRecipeAsModified],
  );

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    StatusBar.setHidden(false);
  }, []);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        exitFullscreen();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [isFullscreen, exitFullscreen]);

  useEffect(() => {
    if (initialRecipe?.videoUrl) {
      handleWatchRecipeVideo(initialRecipe);
    }
  }, [initialRecipe?.id]);

  const handleSelectLocalVideo = useCallback(async () => {
    if (sourceType === 'bilibili' || sourceType === 'kuaishou') {
      Alert.alert(
        '切换视频源',
        '将切换到本地视频，当前网络视频将被清除。确定继续吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('权限不足', '需要相册访问权限来选择视频');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: false,
                quality: 1,
              });
              if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setLocalUri(uri);
                setSourceType('local');
                await saveVideoUrlWithConfirm(uri);
              }
            },
          },
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限不足', '需要相册访问权限来选择视频');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalUri(uri);
      setSourceType('local');
      await saveVideoUrlWithConfirm(uri);
    }
  }, [sourceType, saveVideoUrlWithConfirm]);

  const handleAddNetworkVideo = useCallback(() => {
    if (!inputUrl.trim()) {
      Alert.alert('提示', '请输入B站或快手视频链接');
      return;
    }

    if (sourceType === 'local') {
      Alert.alert(
        '切换视频源',
        '将切换到网络视频，当前本地视频将被清除。确定继续吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: () => processNetworkUrl(),
          },
        ]
      );
      return;
    }

    processNetworkUrl();
  }, [inputUrl, sourceType]);

  const processNetworkUrl = useCallback(async () => {
    const trimmed = inputUrl.trim();
    const parsed = parseVideoUrl(trimmed);

    if (parsed.platform === 'none') {
      Alert.alert('提示', '无法识别该链接，请检查链接格式（支持B站和快手链接）');
      return;
    }

    setNetworkUrl(parsed.originalUrl);
    setEmbedUrl(parsed.embedUrl);
    setLocalUri(null);
    await saveVideoUrlWithConfirm(parsed.originalUrl);

    if (parsed.platform === 'bilibili') {
      setSourceType('bilibili');
    } else if (parsed.platform === 'kuaishou') {
      setSourceType('kuaishou');
    }
  }, [inputUrl, saveVideoUrlWithConfirm]);

  const handleReset = useCallback(() => {
    Alert.alert('重置视频', '确定要清除当前视频吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => {
          setSourceType('none');
          setLocalUri(null);
          setNetworkUrl(null);
          setEmbedUrl(null);
          setInputUrl('');
        },
      },
    ]);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      setIsFullscreen(true);
      StatusBar.setHidden(true);
    }
  }, [isFullscreen, exitFullscreen]);

  const handleWatchRecipeVideo = useCallback(
    (targetRecipe: Recipe) => {
      if (!targetRecipe.videoUrl) return;

      setCurrentRecipe(targetRecipe);

      const videoUrl = targetRecipe.videoUrl;
      const isBilibili =
        videoUrl.includes('bilibili.com') ||
        videoUrl.includes('b23.tv');
      const isKuaishou = videoUrl.includes('kuaishou.com');
      const isLocalFile =
        videoUrl.startsWith('file://') ||
        videoUrl.startsWith('content://');

      setLocalUri(null);
      setNetworkUrl(null);
      setEmbedUrl(null);
      setInputUrl('');

      if (isLocalFile) {
        setLocalUri(videoUrl);
        setSourceType('local');
      } else if (isBilibili) {
        const parsed = parseVideoUrl(videoUrl);
        setNetworkUrl(parsed.originalUrl);
        setEmbedUrl(parsed.embedUrl);
        setSourceType('bilibili');
      } else if (isKuaishou) {
        setNetworkUrl(videoUrl);
        setSourceType('kuaishou');
      } else {
        Alert.alert('提示', '不支持的视频链接格式');
      }
    },
    []
  );

  const recipesWithVideos = recipes.filter((r: Recipe) => r.videoUrl);

  const renderVideoPlayer = () => {
    if (sourceType === 'local' && localUri) {
      return (
        <LocalVideoPlayer
          ref={localPlayerRef}
          uri={localUri}
          isFullscreen={isFullscreen}
          onFullscreenChange={setIsFullscreen}
        />
      );
    }
    if (sourceType === 'bilibili' && networkUrl) {
      return (
        <BilibiliPlayer
          embedUrl={embedUrl}
          originalUrl={networkUrl}
          isFullscreen={isFullscreen}
          onBvIdExtracted={(url) => setEmbedUrl(url)}
        />
      );
    }
    if (sourceType === 'kuaishou' && networkUrl) {
      return <KuaishouPlayer videoId={null} originalUrl={networkUrl} />;
    }
    return (
      <View style={styles.emptyPlayer}>
        <Text style={styles.emptyPlayerText}>请添加本地视频或网络视频链接</Text>
      </View>
    );
  };

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.exitFullscreenButton} onPress={exitFullscreen}>
          <Text style={styles.exitFullscreenText}>{'\u2715'} 退出全屏</Text>
        </TouchableOpacity>
        {renderVideoPlayer()}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentRecipe?.name || '实操视频展示'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.controlBar}>
          <TouchableOpacity
            style={[styles.controlButton, sourceType === 'none' && styles.controlButtonDisabled]}
            onPress={handleToggleFullscreen}
            disabled={sourceType === 'none'}
          >
            <Text style={styles.controlButtonText}>
              {isFullscreen ? '退出全屏' : '全屏'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, sourceType === 'none' && styles.controlButtonDisabled]}
            onPress={handleReset}
            disabled={sourceType === 'none'}
          >
            <Text style={styles.controlButtonText}>重置</Text>
          </TouchableOpacity>
        </View>

        {renderVideoPlayer()}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSelectLocalVideo}>
            <Text style={styles.actionButtonText}>{'\uD83D\uDCF1'} 添加本地视频</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddNetworkVideo}>
            <Text style={styles.actionButtonText}>{'\uD83C\uDF10'} 添加网络视频</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInput}
            placeholder="粘贴B站或快手视频链接..."
            placeholderTextColor="#666"
            value={inputUrl}
            onChangeText={setInputUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {recipesWithVideos.length > 0 && (
          <View style={styles.recipeListSection}>
            <Text style={styles.sectionTitle}>带视频的菜谱</Text>
            <FlatList
              data={recipesWithVideos}
              keyExtractor={(item: Recipe) => item.id}
              renderItem={({ item }: { item: Recipe }) => (
                <View style={styles.recipeItem}>
                  <Text style={styles.recipeItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.watchButton}
                    onPress={() => handleWatchRecipeVideo(item)}
                  >
                    <Text style={styles.watchButtonText}>看本菜品</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.recipeList}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backText: {
    color: '#f4511e',
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 40,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyPlayer: {
    width: '100%',
    height: 220,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyPlayerText: {
    color: '#666',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  urlInputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  urlInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  recipeListSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 13,
    marginBottom: 8,
  },
  recipeList: {
    flex: 1,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  recipeItemName: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  watchButton: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exitFullscreenText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default VideoPlayerScreen;