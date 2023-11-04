import mongoose from "mongoose";

const OrderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      amount: {
        type: Number,
        required: true
      }    
    },
  ],

  amount: {
    type: Number,
    required: true,
  }
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
