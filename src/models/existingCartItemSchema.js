import mongoose from "mongoose";

const existingCartItemSchema = new mongoose.Schema({
  cart_id: Number,
  location_name: String,
  table_no: String,
  item_no: Number,
  item_name: String,
  item_image: String,
  quantity: Number,
  price: Number,
  sp_info: {
    type: String,
    default: "none",
  },
  is_printed: {
    type: Boolean,
    default: false,
  },

});

existingCartItemSchema.pre("save", async function (next) {
  if (this.quantity === 0) {
    try {
      const existingItem = await ExistingCartItem.findOne({ _id: this._id });
      if (existingItem) {
        await existingItem.deleteOne();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
  next();
});

existingCartItemSchema.post("updateOne", async function (doc) {
  if (doc.quantity === 0) {
    try {
      const existingItem = await this.model.findOne({ _id: doc._id });
      if (existingItem) {
        await existingItem.deleteOne();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
});

const ExistingCartItem = mongoose.model("ExistingCartItem",existingCartItemSchema);
export default ExistingCartItem;
