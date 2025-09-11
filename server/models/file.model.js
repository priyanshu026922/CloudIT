import mongoose, { Schema } from 'mongoose';

const fileSchema = new Schema({
    fileUrl: {
        type: String,
        required: true,
    },
    fileName : {
        type: String,
        required: true,
        trim : true
    },
    ownerId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required : true,
        index : true
    },
    accessList : [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
},{
    timestamps: true
});

export const File = mongoose.model("File", fileSchema);