import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { subTask } from "../models/task.models.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import {
    AvailableUserRole,
    TaskStatusEnum,
    UserRoleEnum,
} from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        //This is an array
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("assignedTo", "avatar username fullName"); // need to read about this populate very intresting

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
    const { name, description, assignedTo, status } = req.body;

    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    });

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task Created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
    //Chai
});

const updateTask = asyncHandler(async (req, res) => {
    //Chai
});

const deleteTask = asyncHandler(async (req, res) => {
    //Chai
});

const createSubTask = asyncHandler(async (req, res) => {
    //Chai
});

const updateSubTask = asyncHandler(async (req, res) => {
    //Chai
});

const deleteSubTask = asyncHandler(async (req, res) => {
    //Chai
});

export {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
};
