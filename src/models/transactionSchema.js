import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    transaction_no:{
        type: Number,
        required: true,
        unique: true,
        default: 0
    },
    bill_book:{
        type:Number,
        required: true,
    },
    table_no:{
        type:String,
        required: true,
    },
    location_name:{
        type:String,
        required: true,
    },
    item_details:[{
        item_name:String,
        price:Number,
        quantity:Number,
        total:Number
     }],
    discount_perc:{
        type:Number,
        default:0
    },
    discount_rupees:{
        type:Number,
        default:0
    },
    is_active:{
        type: Boolean,
        default: false
    },
    date:{
        type: Date,
        required: true
    },
    is_printed:{
        type: Boolean,
        default: false
    },
    sp_info:{
        type:String,
        default:"no special instructions"
    },
    is_loading:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction