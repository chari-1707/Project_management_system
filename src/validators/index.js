import { body } from "express-validator";


const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")// it is used multiple times what is do is if above method gets error this will run and sends msg
            .isEmail()// it should be a valid email format
            .withMessage("Email is invalid"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username should be of lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),

        body("fullName")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("full name is required")
    ]
}

export {
    userRegisterValidator
}