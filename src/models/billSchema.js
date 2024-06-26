import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
     bill_book:{
         type:Number,
         required: true,
     },
     bill_no:{
         type: Number,
         required: true,
         unique: true,
         default: 0
     },
     item_details:[{
        item_no:Number,
        item_name:{
            type:String,
        },
        item_image:String,
        price:Number,
        quantity:Number,
        total:Number
     }],
     total_amount:{
        type:Number,
        default:0.00
     },
     discount_reason:{
        type:String,
        default:""
     },
     cgst_tax:{
        type:Number,
        default:0.00
     },
     sgst_tax:{
        type:Number,
        default:0.00
     },
     vat_tax:{
        type:Number,
        default:0.00
     },
     total_tax:{
         type:Number,
         default:0.00
     },
     final_amount:{
        type:Number,
        default:0.00
     },
     splited_amount:{
        type:[Number],
        default:0.00
     },
     table_no:{
        type:String,
        required: true
     },
     location_name:{
        type:String,
        required: true
     },
     created_at:{
        type: Date,
        required: true,
     },
     updated_at:{
        type: Date,
     },

     is_void_payment:{
        type:Boolean,
        default:false
     },
     void_reason:String || "",
     is_transferred:{
         type: Boolean,
         default: false
     },
     is_locked:{
         type: Boolean,
         default: false
     },
     customer_name:{
        type:String,
        default:"",
     },
     customer_phone:{
        type:Number,
        default:0,
     },
     ST_amount:{
        type:Number,
        default:0
     },
     GST_no:{
        type:String,
        default:"",
     },
     discount_perc:{
        type:Number,
        default:0,
     },
     discount_rupees:{
        type:Number,
        default:0,
     },
     round_off:{
        type:String,
        default:"0.00"
     },
     pay_mode:{
        type:[String] || String,
        default:"unpaid"
     }, 
     is_synced:{
        type: Boolean,
        default: false
     },
})

const Bill = mongoose.model("Bill", billSchema);

export default Bill