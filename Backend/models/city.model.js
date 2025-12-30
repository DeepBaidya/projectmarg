import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    centerCoordinates: [
      {
        type: Number,
      }
    ],
    roads: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Roads",
      }
    ]
  },
  { timestamps: true }
);

export const City = mongoose.model("Cities", citySchema);
