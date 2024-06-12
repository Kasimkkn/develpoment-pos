import mongoose from "mongoose";

const spInfoSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true,
        unique: true
    },
    sp_info:String,
    is_synced:{
        type: Boolean,
        default: false
     },
})

const SpInfo = mongoose.model("SpInfo", spInfoSchema);
export default SpInfo