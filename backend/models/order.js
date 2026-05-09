
 const mongoose = require("mongoose");
 
 const orderItemSchema = new mongoose.Schema(
   {
     product: { type: mongoose.Schema.Types.ObjectId, ref: 
"Product", required: true },
     name: String,
     price: Number,
     qty: Number,
   },
   { _id: false }
 );
 
 const orderSchema = new mongoose.Schema(
   {
     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", 
required: true },
     items: [orderItemSchema],
     total: { type: Number, required: true },
     status: { type: String, enum: ["pending", "confirmed", 
"shipped", "delivered"], default: "pending" },
     address: { type: String, required: true },
     phone: { type: String, required: true },
   },
   { timestamps: true }
 );
 
 module.exports = mongoose.model("Order", orderSchema);