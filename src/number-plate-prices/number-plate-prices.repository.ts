import { MongoClient } from "mongodb";
import { ConfigVariable } from "../config/config-variable.enum.js";
import { NumberPlatePriceEntity } from "./models/number-plate-price.entity.js";
import { NumberPlatePrice } from "./models/number-plate-price.js";

export class NumberPlatePricesRepository {
  protected readonly _mongoClient: MongoClient;
  protected readonly _collectionName = "number-plates";
  protected readonly _dbName = "number-plates";
  constructor() {
    const mongodbUrl = process.env[ConfigVariable.MongodbUrl];
    this._mongoClient = new MongoClient(mongodbUrl);
    this._mongoClient.once("open", async () => {
      const collection = this._mongoClient.db(this._dbName).collection(this._dbName);
      await collection.createIndexes([{ key: { number_plate: 1 }, unique: true }]);
      console.debug(`Ensured indexes for [${this._dbName}.${this._collectionName}].`);
    });
    this._mongoClient.connect();
  }

  async get(numberPlate: string): Promise<NumberPlatePriceEntity> {
    const document = await this._mongoClient
      .db(this._dbName)
      .collection(this._collectionName)
      .findOne<NumberPlatePriceEntity>({ number_plate: numberPlate });
    return document;
  }

  async update(numberPlate: string, price: number) {
    const updateDoc: NumberPlatePrice = { number_plate: numberPlate, price };
    return this._mongoClient
      .db(this._dbName)
      .collection(this._collectionName)
      .updateOne({ number_plate: numberPlate }, { $set: updateDoc }, { upsert: true });
  }
}
