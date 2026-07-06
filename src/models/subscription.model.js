import mongoose ,{Schema, schema} from "mongoose";

const subsciptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const Subsciption = mongoose.model("Subsciption",subsciptionSchema)