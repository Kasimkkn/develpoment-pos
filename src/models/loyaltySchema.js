import mongoose from "mongoose";

const loyaltySchema = new mongoose.Schema({
    customer_no:{
        type: Number,
        required: true,
        unique: true
    },
    customer_name:{
        type: String,
        required: true,
    },
    total_points:{
        type: Number,
        default: 0
    },
    used_points:{
        type: Number,
        default: 0
    },
    remaining_points:{
        type: Number,
        default: 0
    },
    date:{
        type: Date,
        required: true
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})


const Loyalty = mongoose.model("Loyalty", loyaltySchema);
export default Loyalty