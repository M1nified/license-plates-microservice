import { NumberPlatePricesRepository } from "../number-plate-prices/number-plate-prices.repository.js";
import { RedisLockService } from "../redis-lock/redis-lock.service.js";

const GET_PRICE_LOCK_KEY_PREFIX = "getprice";
const GET_PRICE_LOCK_TTL_SEC = 5;

export class NumberPlatesService {
  constructor(
    protected readonly _numberPlatesRepository: NumberPlatePricesRepository,
    protected readonly _redisLockService: RedisLockService
  ) {}

  async getPrice(numberPlate: string, skipCacheForRead = true): Promise<number> {
    if (skipCacheForRead) {
      return this._requestAndStorePrice(numberPlate);
    }

    let isLocked = true;
    const lockKey = this.getLockKey(numberPlate);
    while (isLocked) {
      isLocked = await this._redisLockService.isLocked(lockKey);
      await new Promise((r) => setTimeout(r, 100));
    }
    const numberPlatePriceDoc = await this._numberPlatesRepository.get(numberPlate);

    if (!numberPlatePriceDoc) {
      const price = await this._runPriceRequest(numberPlate);
      return price;
    }

    console.debug("Serving from cache...");
    return numberPlatePriceDoc.price;
  }

  protected async _runPriceRequest(numberPlate: string): Promise<number> {
    console.debug("Requesting from external service...");

    const lockKey = this.getLockKey(numberPlate);

    let priceRequestFinished = false;
    const extendLockIfNotFinished = async () => {
      if (!priceRequestFinished) {
        await this._redisLockService.lock(lockKey, GET_PRICE_LOCK_TTL_SEC);
        setTimeout(() => extendLockIfNotFinished(), (GET_PRICE_LOCK_TTL_SEC / 2) * 1000);
      }
    };
    extendLockIfNotFinished();

    const price = await this._requestAndStorePrice(numberPlate);
    priceRequestFinished = true;
    this._redisLockService.unlock(lockKey);

    return price;
  }

  protected async _requestAndStorePrice(numberPlate: string): Promise<number> {
    const price = await this.getExternalPrice(numberPlate);
    await this._numberPlatesRepository.update(numberPlate, price);
    return price;
  }

  async getExternalPrice(_numberPlate: string): Promise<number> {
    const sleep = Math.round(Math.random() * 30000 + 5000);
    console.log(`Calling to external service... (${sleep} ms timeout)`);
    return new Promise((r) => setTimeout(() => r(Math.floor(Math.random() * 100)), sleep));
  }

  getLockKey(numberPlate: string): string {
    return `${GET_PRICE_LOCK_KEY_PREFIX}:${numberPlate}`;
  }
}
