import mongoose from "mongoose";

const rejectedItemSchema = new mongoose.Schema({
    item_details:{
        item_no:Number,
        item_name:String,
        item_image:String,
        quantity:Number,
        price:Number,
        sp_info:String,
     },
    table_no:String,
    location_name:String,
    is_active:{
        type: Boolean,
        default: true
    },
    date:{
        type: Date,
        required: true
    },
    is_printed:{
        type: Boolean,
        default: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },

})

const RejectedItem = mongoose.model("RejectedItem", rejectedItemSchema);
export default RejectedItem