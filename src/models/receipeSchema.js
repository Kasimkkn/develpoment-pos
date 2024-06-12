import mongoose from "mongoose";

const receipeSchema = new mongoose.Schema({
    receipe_no:{
        type: Number,
        required: true,
        unique: true
    },
    sub_item_details:[{
        item_no:Number,
        item_name:String,
        quantity:Number,
    }],
    item_no:{
        type: Number,
        required: true
    },
    item_name:{
        type: String,
        required: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Receipe = mongoose.model("Receipe", receipeSchema);
export default Receipe