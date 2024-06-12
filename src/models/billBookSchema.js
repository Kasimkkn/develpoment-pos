import mongoose from "mongoose";

const billBookSchema = new mongoose.Schema({
    bill_book:{
        type: Number,
        unique: true,
    },
    is_active:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false
     },
    
})

const BillBook = mongoose.model("BillBook", billBookSchema);
export default BillBook