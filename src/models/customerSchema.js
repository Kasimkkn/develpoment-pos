import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customer_code:{
        type: Number,
        required: true,
        unique: true
    },
    customer_name:{
        type: String,
        required: true,
    },
    address1:String,
    city:String,
    state:String,
    GST_no:String,
    mobile:String,
    email:String,
    date_of_birth:Date,
    anniversary_date:Date,
    ambience:String,
    food:String,
    service:String,
})

const Customer = mongoose.model("Customer", customerSchema);
export default Customer