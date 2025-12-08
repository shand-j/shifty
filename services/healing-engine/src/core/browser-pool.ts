import { Browser, chromium, firefox, webkit } from 'playwright';

interface PooledBrowser {
  browser: Browser;
  type: 'chromium' | 'firefox' | 'webkit';
  lastUsed: number;
  inUse: boolean;
}

export class BrowserPool {
  private pool: Map<string, PooledBrowser> = new Map();
  private maxSize: number;
  private ttlMinutes: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 10, ttlMinutes: number = 5) {
    this.maxSize = maxSize;
    this.ttlMinutes = ttlMinutes;
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Run cleanup every minute
  }

  async getBrowser(browserType: 'chromium' | 'firefox' | 'webkit'): Promise<Browser> {
    // Try to find an idle browser of the same type
    for (const [id, pooledBrowser] of this.pool.entries()) {
      if (pooledBrowser.type === browserType && !pooledBrowser.inUse) {
        pooledBrowser.inUse = true;
        pooledBrowser.lastUsed = Date.now();
        console.log(`♻️  Reusing ${browserType} browser from pool (${this.pool.size}/${this.maxSize})`);
        return pooledBrowser.browser;
      }
    }

    // If pool is at max size, close oldest idle browser
    if (this.pool.size >= this.maxSize) {
      await this.closeOldestIdleBrowser();
    }

    // Create new browser
    console.log(`🚀 Creating new ${browserType} browser (${this.pool.size + 1}/${this.maxSize})`);
    const browser = await this.launchBrowser(browserType);
    
    // Use crypto.randomUUID for guaranteed uniqueness
    const id = `${browserType}-${Date.now()}-${crypto.randomUUID()}`;
    this.pool.set(id, {
      browser,
      type: browserType,
      lastUsed: Date.now(),
      inUse: true
    });

    return browser;
  }

  async releaseBrowser(browser: Browser): Promise<void> {
    for (const [id, pooledBrowser] of this.pool.entries()) {
      if (pooledBrowser.browser === browser) {
        pooledBrowser.inUse = false;
        pooledBrowser.lastUsed = Date.now();
        console.log(`✅ Released ${pooledBrowser.type} browser back to pool`);
        return;
      }
    }
  }

  private async launchBrowser(browserType: 'chromium' | 'firefox' | 'webkit'): Promise<Browser> {
    switch (browserType) {
      case 'firefox':
        return await firefox.launch({ headless: true });
      case 'webkit':
        return await webkit.launch({ headless: true });
      default:
        return await chromium.launch({ headless: true });
    }
  }

  private async closeOldestIdleBrowser(): Promise<void> {
    let oldest: { id: string; lastUsed: number } | null = null;

    for (const [id, pooledBrowser] of this.pool.entries()) {
      if (!pooledBrowser.inUse) {
        if (!oldest || pooledBrowser.lastUsed < oldest.lastUsed) {
          oldest = { id, lastUsed: pooledBrowser.lastUsed };
        }
      }
    }

    if (oldest) {
      const pooledBrowser = this.pool.get(oldest.id);
      if (pooledBrowser) {
        console.log(`🗑️  Closing oldest idle ${pooledBrowser.type} browser to make room`);
        await pooledBrowser.browser.close();
        this.pool.delete(oldest.id);
      }
    }
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    const ttlMs = this.ttlMinutes * 60 * 1000;
    const idsToRemove: string[] = [];

    for (const [id, pooledBrowser] of this.pool.entries()) {
      // Close browsers that have been idle for longer than TTL
      if (!pooledBrowser.inUse && (now - pooledBrowser.lastUsed) > ttlMs) {
        idsToRemove.push(id);
      }
    }

    for (const id of idsToRemove) {
      const pooledBrowser = this.pool.get(id);
      if (pooledBrowser) {
        console.log(`🧹 Cleaning up idle ${pooledBrowser.type} browser (idle for ${Math.round((now - pooledBrowser.lastUsed) / 60000)} minutes)`);
        try {
          await pooledBrowser.browser.close();
        } catch (error) {
          console.error(`Error closing browser ${id}:`, error);
        }
        this.pool.delete(id);
      }
    }

    if (idsToRemove.length > 0) {
      console.log(`🧹 Cleanup complete: removed ${idsToRemove.length} idle browsers, ${this.pool.size} remaining`);
    }
  }

  async closeAll(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log(`🛑 Closing all browsers in pool (${this.pool.size} total)`);
    
    const closePromises: Promise<void>[] = [];
    for (const [id, pooledBrowser] of this.pool.entries()) {
      closePromises.push(
        pooledBrowser.browser.close().catch(error => {
          console.error(`Error closing browser ${id}:`, error);
        })
      );
    }

    await Promise.all(closePromises);
    this.pool.clear();
    console.log('✅ All browsers closed');
  }

  getStats(): { total: number; inUse: number; idle: number; byType: Record<string, number> } {
    const stats = {
      total: this.pool.size,
      inUse: 0,
      idle: 0,
      byType: {} as Record<string, number>
    };

    for (const pooledBrowser of this.pool.values()) {
      if (pooledBrowser.inUse) {
        stats.inUse++;
      } else {
        stats.idle++;
      }

      stats.byType[pooledBrowser.type] = (stats.byType[pooledBrowser.type] || 0) + 1;
    }

    return stats;
  }
}
