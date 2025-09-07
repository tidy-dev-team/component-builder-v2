interface CacheEntry {
  image: string;
  timestamp: number;
  size: number; // Approximate size in bytes
}

interface ComponentCacheEntry {
  componentProps: any[];
  nestedInstances: any[];
  componentDescription: string;
  componentImage: string | null;
  timestamp: number;
  size: number;
}

class ImageCache {
  private cache = new Map<string, CacheEntry>();
  private componentCache = new Map<string, ComponentCacheEntry>();
  private maxSize = 10 * 1024 * 1024; // 10MB limit
  private currentSize = 0;

  // Estimate base64 image size (base64 is ~1.33x original size)
  private estimateSize(base64String: string): number {
    return Math.ceil(base64String.length * 0.75); // Convert back to approximate bytes
  }

  // Remove oldest entries until we have enough space
  private evictOldEntries(neededSpace: number) {
    // Convert map to array sorted by timestamp (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    for (const [key, entry] of entries) {
      if (this.currentSize + neededSpace <= this.maxSize) break;
      
      console.log(`🗑️ Evicting cached image: ${key} (${entry.size} bytes)`);
      this.cache.delete(key);
      this.currentSize -= entry.size;
    }
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    console.log(`📦 Cache hit for: ${key}`);
    return entry.image;
  }

  set(key: string, image: string) {
    const size = this.estimateSize(image);
    
    // Don't cache if single image is larger than our limit
    if (size > this.maxSize) {
      console.log(`⚠️ Image too large to cache: ${key} (${size} bytes)`);
      return;
    }

    // Evict old entries if needed
    if (this.currentSize + size > this.maxSize) {
      this.evictOldEntries(size);
    }

    // Remove existing entry if it exists (to update size)
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }

    // Add new entry
    const entry: CacheEntry = {
      image,
      timestamp: Date.now(),
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;

    console.log(`💾 Cached image: ${key} (${size} bytes) - Total: ${this.currentSize} bytes`);
  }

  // Component cache methods
  getComponentData(key: string): ComponentCacheEntry | null {
    const entry = this.componentCache.get(key);
    if (!entry) return null;

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    console.log(`🎯 Component cache hit for: ${key}`);
    return entry;
  }

  setComponentData(key: string, data: Omit<ComponentCacheEntry, 'timestamp' | 'size'>) {
    const dataString = JSON.stringify(data);
    const size = this.estimateSize(dataString);
    
    // Don't cache if too large
    if (size > this.maxSize) {
      console.log(`⚠️ Component data too large to cache: ${key}`);
      return;
    }

    const entry: ComponentCacheEntry = {
      ...data,
      timestamp: Date.now(),
      size
    };

    this.componentCache.set(key, entry);
    console.log(`💾 Cached component data: ${key} (${size} bytes)`);
  }

  getStats() {
    return {
      imageEntries: this.cache.size,
      componentEntries: this.componentCache.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: (this.currentSize / this.maxSize * 100).toFixed(1) + '%'
    };
  }

  clear() {
    console.log(`🧹 Clearing all caches (${this.cache.size} images, ${this.componentCache.size} components)`);
    this.cache.clear();
    this.componentCache.clear();
    this.currentSize = 0;
  }
}

// Single instance for the entire app
export const imageCache = new ImageCache();