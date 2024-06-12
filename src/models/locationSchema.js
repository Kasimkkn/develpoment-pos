import mongoose from "mongoose";

const locationShcema = new mongoose.Schema({
    location_no:{
        type: Number,
        required: true,
        unique: true
    },
    location_name:{
        type: String,
        required: true,
        unique: true,
    },
    location_price:{
        type: String,
        default:"one"
    },
    is_taxable:{
        type: Boolean, 
        default: true
    },
    status:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false
     },
},
{
    timestamps: true
})

const Location = mongoose.model("Location", locationShcema);
export default Location
