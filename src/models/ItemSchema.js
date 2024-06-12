import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    item_no:{
        type: Number,
        required: true,
        unique: true
    },
    item_name:{
        type: String,
        required: true,

    },
    item_image:{
        type: String,
        required: true,
    },
    rate_one : {
        type: Number,
        default: 0.00
    },
    rate_two : {
        type: Number,
        default: 0.00
    },
    rate_three : {
        type: Number,
        default: 0.00
    },
    rate_four : {
        type: Number,
        default: 0.00
    },
    rate_five : {
        type: Number,
        default: 0.00
    },
    rate_six : {
        type: Number,
        default: 0.00
    },
    tax_perc:{
        type:Number,
        default:0.00
    },
    category_no:{
        type:Number,
        default:1
    },
    status:{
        type: Boolean,
        default: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Item = mongoose.model("Item", itemSchema);
export default Item