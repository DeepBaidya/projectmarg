import mongoose from "mongoose";

const roadSchema = new mongoose.Schema(
    {
        coordinates: [
            [
                {
                    type: Number,
                    require: true
                }
            ]
        ],
        condition:{
            type: Number
        }
    },{ timestamps: true }
);

export const Road = mongoose.model("Roads", roadSchema);
