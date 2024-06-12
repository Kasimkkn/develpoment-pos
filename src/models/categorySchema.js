import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    category_no:{
        type: Number,
        required: true,
        unique: true
    },
    category_name:{
        type: String,
        required: true,
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

const Category = mongoose.model("Category", categorySchema);
export default Category