import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_no: {
    type: Number,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  mobile_no: {
    type: Number,
    required: true,
  },
  user_role: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  creation_date: {
    type: Date,
    required: true,
  },
  is_synced:{
      type: Boolean,
      default: false
   },
});


const User = mongoose.model("User", userSchema);
export default User