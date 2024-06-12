import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
    currency_name:{
        type:String,
        required:true
    },
    is_gstAvailable:{
        type:Boolean,
        default:false
    },
    gst_percentage:{
        type:Number,
        default:0
    },
    is_ValueAddedTaxAvailable:{
        type:Boolean,
        default:false
    },
    vat_percentage:{
        type:Number,
        default:0
    },
    is_noTaxAvailable:{
        type:Boolean,
        default:false
    },
    bill_printing_type:{
        type:String,
        default:"76mm",
        enum:["A4","A5","76mm"]
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const Preference = mongoose.model("Preference", preferenceSchema);

export default Preference