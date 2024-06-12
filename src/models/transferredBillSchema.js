import mongoose from "mongoose";

const transferredBillSchema = new mongoose.Schema({
    bill_no:{
        ref:"BIll",
        type: mongoose.Schema.Types.bill_no
    },
    tr_date:{
        type: Date,
        required: true
    },
    bill_Book:{
        ref:"BillBook",
        type: mongoose.Schema.Types.bill_book
    },
    final_amount:Number,
    is_synced:{
        type: Boolean,
        default: false
     },
})

const TransferredBill = mongoose.model("TransferredBill", transferredBillSchema);
export default TransferredBill