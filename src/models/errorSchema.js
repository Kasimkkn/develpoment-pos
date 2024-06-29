import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
    error:String,
    create_at:{
        type: Date,
        default: Date.now()
    }
});


const ErrorStore = mongoose.model("Error", errorSchema);
export default ErrorStore