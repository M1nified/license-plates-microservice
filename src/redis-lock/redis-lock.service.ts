import Redis from "ioredis";
import { ConfigVariable } from "../config/config-variable.enum.js";

export class RedisLockService {
  protected readonly _redisClient: Redis.Redis;

  constructor() {
    const redisUrl = process.env[ConfigVariable.RedisUrl];
    this._redisClient = new Redis(redisUrl);
  }

  async isLocked(lock: string): Promise<boolean> {
    const value = await this._redisClient.get(this._getLockKey(lock));
    return !!value;
  }

  async unlock(lock: string): Promise<void> {
    console.debug(`Unlocking [${lock}]...`);
    await this._redisClient.del(this._getLockKey(lock));
  }

  async lock(lock: string, ttl?: number): Promise<void> {
    console.debug(`Locking [${lock}]...`);
    const lockKey = this._getLockKey(lock);
    if (ttl) {
      await this._redisClient.setex(lockKey, ttl, JSON.stringify(true));
    } else {
      await this._redisClient.set(lockKey, JSON.stringify(true));
    }
  }

  protected _getLockKey(lock: string): string {
    return `lock:${lock}`;
  }
}
