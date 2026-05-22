import { Image } from 'react-native';

const MAX_CACHE_SIZE = 5;

interface CachedImage {
  uri: string;
  timestamp: number;
}

class ImageCacheManager {
  private cache: CachedImage[] = [];
  private static instance: ImageCacheManager;

  private constructor() {
    // 单例模式
  }

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * 添加图片到缓存
   * @param uri 图片URI
   */
  addToCache(uri: string): void {
    // 检查是否已在缓存中
    const existingIndex = this.cache.findIndex(item => item.uri === uri);
    if (existingIndex !== -1) {
      // 更新时间戳
      this.cache[existingIndex].timestamp = Date.now();
      // 移到数组末尾（最近使用）
      const [item] = this.cache.splice(existingIndex, 1);
      this.cache.push(item);
      console.log(`[ImageCache] Updated access time for: ${uri}`);
      return;
    }

    // 添加新图片到缓存
    this.cache.push({
      uri,
      timestamp: Date.now()
    });
    console.log(`[ImageCache] Added to cache: ${uri}`);

    // 如果超过最大缓存大小，释放最旧的图片
    if (this.cache.length > MAX_CACHE_SIZE) {
      const removedItem = this.cache.shift();
      if (removedItem) {
        console.log(`[ImageCache] Cache limit reached, removing oldest: ${removedItem.uri}`);
        console.log(`[ImageCache] Current cache size: ${this.cache.length}`);
      }
    }
  }

  /**
   * 获取图片并加入缓存
   * @param uri 图片URI
   */
  loadImage(uri: string): void {
    this.addToCache(uri);
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    const uris = this.cache.map(item => item.uri);
    this.cache = [];
    console.log(`[ImageCache] Cleared cache, removed ${uris.length} images`);
  }

  /**
   * 获取当前缓存大小
   */
  getCacheSize(): number {
    return this.cache.length;
  }

  /**
   * 获取缓存的图片URI列表
   */
  getCachedUris(): string[] {
    return this.cache.map(item => item.uri);
  }

  /**
   * 检查图片是否在缓存中
   */
  isInCache(uri: string): boolean {
    return this.cache.some(item => item.uri === uri);
  }
}

export const imageCacheManager = ImageCacheManager.getInstance();
