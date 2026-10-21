import { User } from "../models/user.model.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const getProjects = asyncHandler(async (req, res) => {
    //Test
});

const getProjectById = asyncHandler(async (req, res) => {
    //Test
});

const createProject = asyncHandler(async (req, res) => {
    //Test
});

const deleteProject = asyncHandler(async (req, res) => {
    //Test
});

const updateProject = asyncHandler(async (req, res) => {
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
