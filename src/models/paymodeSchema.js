import mongoose from "mongoose";

const paymodeSchema = new mongoose.Schema({
    paymode_no:{
        type: Number,
        required: true,
        unique: true
    },
    paymode_name:{
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Paymode = mongoose.model("Paymode", paymodeSchema);
export default Paymode