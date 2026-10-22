import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { subTask } from "../models/task.models.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
    //Chai
});

const createTask = asyncHandler(async (req, res) => {
    //Chai
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
