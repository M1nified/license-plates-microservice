import { ObjectId } from "mongodb";
import { NumberPlatePrice } from "./number-plate-price";

export interface NumberPlatePriceEntity extends NumberPlatePrice {
  _id: ObjectId;
}
