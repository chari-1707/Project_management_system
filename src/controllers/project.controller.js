import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEnum } from "../utils/constants";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(401, "name or description is required");
    }

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id), // This will make sure that it is 100% mongoose id what ever that we are passing inside this method
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRoleEnum.ADMIN,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created succesfully"));
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project deleted successfully"));
});

const getProjects = asyncHandler(async (req, res) => {
    //Test
});

const getProjectById = asyncHandler(async (req, res) => {
    //Test
});

const addMemebersToProjects = asyncHandler(async (req, res) => {
    //Test
});

const getProjectMembers = asyncHandler(async (req, res) => {
    //Test
});

const updateMemberRole = asyncHandler(async (req, res) => {
    //Test
});

const deleteMember = asyncHandler(async (req, res) => {
    //Test
});

export {
    getProjects,
    getProjectById,
    getProjectMembers,
    createProject,
    deleteProject,
    updateProject,
    addMemebersToProjects,
    updateMemberRole,
    deleteMember,
};
