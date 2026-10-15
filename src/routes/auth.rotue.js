import { Router } from "express";
import { getCurrentUser, login, logoutUser, registerUser } from "../controllers/auth.controller.js";

import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), login);
router.post("/logout", verifyJWT, logoutUser);
router.post("/currentuser", verifyJWT, getCurrentUser);



export default router;