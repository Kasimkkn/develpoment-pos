import mongoose from "mongoose";

const userRightsSchema = new mongoose.Schema({
  user_no: {
    type: Number,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  master_option: {
    type: Boolean,
    default : false
  },
  edit_bills: {
    type: Boolean,
    default : false
  },
  reports: {
    type: Boolean,
    default : false
  },
  item_wise_report: {
    type: Boolean,
    default : false
  },
  category_wise_report: {
    type: Boolean,
    default : false
  },
  item_wise_monthly_report: {
    type: Boolean,
    default : false
  },
  table_wise_report: {
    type: Boolean,
    default : false
  },
  unpaid_bills: {
    type: Boolean,
    default : false
  },
  payment_wise_report: {
    type: Boolean,
    default : false
  },
  location_wise_report: {
    type: Boolean,
    default : false
  },
  daily_sales: {
    type: Boolean,
    default : false
  },
  monthly_sales: {
    type: Boolean,
    default : false
  },
  stocks:{
    type: Boolean,
    default : false
  },
  stock_details: {
    type: Boolean,
    default : false
  },
  purchase_details: {
    type: Boolean,
    default : false
  },
  receipe_details: {
    type: Boolean,
    default : false
  },
  is_synced:{
      type: Boolean,
      default: false
   },
});

const UserRights = mongoose.model("UserRights", userRightsSchema);
export default UserRights;
