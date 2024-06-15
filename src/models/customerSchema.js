import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customer_no:{
        type: Number,
        required: true,
        unique: true
    },
    customer_name:{
        type: String,
        required: true,
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    GST_no:{
        type:String
    },
    email:{
        type:String
    },
    date_of_birth:Date,
    anniversary_date:Date,
    food:String,
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Customer = mongoose.model("Customer", customerSchema);
export default Customer