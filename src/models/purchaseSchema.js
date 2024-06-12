import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    purchase_no:Number,
    item_details:{
        item_no:Number,
        item_name:String,
        quantity:Number,
        mrp:Number,
        total:Number,   
     },
    date:{
        type: Date,
        required: true
    },
    is_selected:{
        type: Boolean,
        default: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Purchase = mongoose.model("Purchase", purchaseSchema)

export default Purchase
