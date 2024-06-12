import mongoose from 'mongoose';
import Category from "./src/models/categorySchema.js";
import Item from "./src/models/ItemSchema.js";
import Location from "./src/models/locationSchema.js";
import User from "./src/models/userSchema.js";
import LocationInfo from "./src/models/locationInfoSchema.js";
import ExistingCartItem from "./src/models/existingCartItemSchema.js";
import Bill from "./src/models/billSchema.js";
import BillBook from "./src/models/billBookSchema.js";
import Preference from "./src/models/preferenceSchema.js";
import Transaction from "./src/models/transactionSchema.js";
import SpInfo from "./src/models/spInfoSchema.js";
import RejectedItem from "./src/models/rejectedItemSchema.js";
import BillInfo from "./src/models/billInfoSchema.js";
import Loyalty from "./src/models/loyaltySchema.js";
import Stock from "./src/models/stockSchema.js";
import Receipe from "./src/models/receipeSchema.js";
import Purchase from "./src/models/purchaseSchema.js";
import UserRights from "./src/models/userRightsSchema.js";

export async function pushToCloud(cloudConnection, collectionName, Modal, document) {
  try {
    const CloudModel = cloudConnection.model(collectionName , Modal.schema);
    if (!CloudModel) {
      throw new Error(`Model not found for collection: ${collectionName}`);
    }
    // change the filed is_synced to true before saving to cloud
    document.is_synced = true;
    const cloudDoc = new CloudModel(document.toObject());
    await cloudDoc.save();
  } catch (error) {
    console.error(`Error saving document to cloud for model ${collectionName}:`, error);
    throw error; // Rethrow error to handle in syncData
  }
}
export async function syncData(cloudConnection) {
  try {
    const models = [
      Bill, Category, Item, BillBook, BillInfo, ExistingCartItem, Location, LocationInfo,
      User, UserRights,Preference, Transaction, SpInfo, RejectedItem,
      Loyalty, Stock, Receipe, Purchase
    ];

    for (const Model of models) {
      const documentsToSync = await Model.find({ is_synced: false }).exec();
      if (documentsToSync.length === 0) {
        console.log(`No documents to sync for model ${Model.modelName}`);
        continue;
      }

      for (const doc of documentsToSync) {
        try {
          await pushToCloud(cloudConnection, Model.modelName, Model ,  doc);
          console.log(`Synced document ${doc._id} for model ${Model.modelName}`);
          await Model.updateMany({ _id: doc._id }, { is_synced: true }); // Update is_synced flag
        } catch (error) {
          console.error(`Error syncing document ${doc._id} for model ${Model.modelName}: ${error}`);
        }
      }
    }

    console.log('Syncing completed successfully');
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}
