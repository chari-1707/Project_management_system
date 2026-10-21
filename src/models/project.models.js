import mongoose, { Schema } from "mongoose";

//here Schem.types.objectId it is refering to another schema so we need to give the same name and yeah!!
const projectSchema = new Schema(
    {
        name: {
            type: String,
            Unique: true,
            trim: true,
            required: true,
        },
        description: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId, //This one thing that i need to learn as we go along will understand
            ref: "User", // make sure you give the same name as you did in the export thing in user schema
            required: true,
        },
    },
    { timestamps: true },
);

export const Project = mongoose.model("Project", projectSchema);