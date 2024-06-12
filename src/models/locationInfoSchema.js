import mongoose from "mongoose";

const locationInfoSchema = new mongoose.Schema({
    serial_no:String,
    location_no:{
        type: Number,
        required: true
    },
    table_no:{
        type: String,
        required: true,
        unique: true
    },
    status:{
        type: Boolean,
        default: false
    },
    is_synced:{
        type: Boolean,
        default: false
     },
})

const LocationInfo = mongoose.model("LocationInfo", locationInfoSchema);
export default LocationInfo