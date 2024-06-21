import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    supplier_no:{
        type: Number,
        required: true,
        unique: true
    },
    supplier_name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true
    },
    mobile_no:{
        type: Number,
        required: true
    },
    status:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false 
    }
})

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier