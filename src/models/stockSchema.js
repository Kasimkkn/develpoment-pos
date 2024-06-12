import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    item_no:{
        type: Number,
        required: true,
        unique: true
    },
    item_name:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number,
        default: 0
    },
    mrp:{
        type: Number,
        default: 0
    },
    total:{
        type: Number,
        default: 0
    },
    min_stock:{
        type: Number,
        default: 0
    },
    addded_at:{
        type: Date,
        required: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Stock = mongoose.model("Stock", stockSchema)

export default Stock