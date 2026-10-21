import mongoose, { Schema } from "mongoose";

import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";


//Same here also schema.Types.ObjectId means its refereing to another schema 
const projectMemberSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        role: {
            type: String,
            enum: AvailableUserRole,
            default: UserRoleEnum,
        },
    },
    { timestamps: true },
);

//actually this collection contatins the userID and ProjectID means a document in this collection refer to which user working on which project 

export const ProjectMember = mongoose.model(
    "ProjectMember",
    projectMemberSchema,
);