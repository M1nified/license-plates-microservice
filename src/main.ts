import express, { Request } from "express";
import { NumberPlatePricesRepository } from "./number-plate-prices/number-plate-prices.repository.js";
import { NumberPlatesService } from "./number-plates/number-plates.service.js";
import { RedisLockService } from "./redis-lock/redis-lock.service.js";

const port = 3000;

const app = express();

const numberPlatesRepository = new NumberPlatePricesRepository();
const redisLockService = new RedisLockService();
const numberPlatesService = new NumberPlatesService(numberPlatesRepository, redisLockService);

console.log("Starting service...");

app.get("/number-plate/:numberPlate/price", async (req: Request, res) => {
  const { numberPlate } = req.params;
  const { skip_cache_for_read: skipCacheForRead } = req.query;
  console.log(`Received request.`, { numberPlate, skipCacheForRead });
  const price = await numberPlatesService.getPrice(numberPlate, skipCacheForRead && skipCacheForRead === "true");
  res.status(200).send({ price });
});

app.listen(port, () => {
  console.log("Listening on port 3000");
});
