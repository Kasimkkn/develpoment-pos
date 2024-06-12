import mongoose from "mongoose";

const billInfoSchema = new mongoose.Schema({
    bill_footer:String,
    HSN_code:String,
    GSTIN_no:String,
    FSSAI_code:String,
    customer_id:Number,
    customer_mobile:String,
    customer_name:String,
    resturant_name:String,
    loyalty_amount : Number,
    loyalty_points : Number,
    how_much_points : Number,
    how_much_amount : Number,
    is_synced:{
        type: Boolean,
        default: false
     },
})

const BillInfo = mongoose.model("BillInfo", billInfoSchema);
export default BillInfo