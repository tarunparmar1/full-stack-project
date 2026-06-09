import mongoose,{Schema} from "mongoose";
import mongooseaggrigatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
   video: {
    type: String,
    required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,   
    },
    description: {
        type: String,
    },
    duration: {
        type: number,
    },
    views: {
        type: number,
        default: 0,
    },
    isPublished: {
        type: boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    {
        timestamps: true,
    }
)

videoSchema.plugin(mongooseaggrigatePaginate)
export const Video = mongoose.model("Video", videoSchema)