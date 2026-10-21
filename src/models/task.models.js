import mongoose, { Schema } from "mongoose";

import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

//here evrey task is associated with an project and vice versa
const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: String,
        project: {
            type: Schema.Types.ObjectId, // here every task have a project and its having a type of project schema and reference is "Project"
            ref: "Project",
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: AvailableTaskStatus,
            default: TaskStatusEnum.TODO,
        },
        attachments: {
            type: [
                {
                    url: String,
                    mimetype: String,
                    size: Number,
                },
            ],
            default: [],
        },
    },
    { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);