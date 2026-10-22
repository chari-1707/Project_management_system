import { Router } from "express";
import {
    getProjects,
    getProjectById,
    getProjectMembers,
    createProject,
    deleteProject,
    updateProject,
    addMemebersToProjects,
    updateMemberRole,
    deleteMember,
} from "../controllers/project.controller.js";

import { validate } from "../middlewares/validator.middleware.js";
import {
    addMembertoProjectValidator,
    createProjectValidator,
} from "../validators/index.js";

import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT); // This is actually a short cut way instead of writing in every validator

//Here one the same endpoint different types of requests ok This CRAZY right!! new kind of way to write
router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator, validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject,
    )
    .delete(validateProjectPermission([UserRoleEnum.ADMIN]), deleteProject);

router
    .route("/:projectId/members/") //in express when we keep : then only it consider it as params else it is considered as object and order doesn't matter if we keep :
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        addMembertoProjectValidator,
        validate,
        addMemebersToProjects,
    );

router
    .route("/:projectId/members/:userId/")
    .put(validateProjectPermission([UserRoleEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRoleEnum.ADMIN]), deleteMember);

export default router;
