import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    sub_category_no:{
        type: Number,
        required: true,
        unique: true
    },
    sub_category_name:{
        type: String,
        required: true,
    },
    parents_sub_category_no:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Category"
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


const SubCategory = mongoose.model("SubCategory", subCategorySchema);
export default SubCategory