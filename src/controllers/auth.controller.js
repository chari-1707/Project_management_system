import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailGenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;//get the data

    const exitstedUser = await User.findOne({ // check whether it exists in data base or not
        $or: [{ username }, { email }] // you can do like username:username and email:email
    })

    if (exitstedUser) {
        throw new ApiError(409, "User with email or username already exist", []);
    }

    //create the user if not exist in the data base
    const user = await User.create({
        username: username, // you can just do like username, email,passsword 
        email: email,
        password: password,
        isEmailVerified: false
    })

    //create general token
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    //fill the fields of user provided by the user schema
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    //save to the database using save method
    await user.save({ validateBeforeSave: false });

    //send an email to the user 
    await sendEmail(
        {
            email: user?.email,
            subject: "Please verfiy your email",
            mailGenContent: emailVerificationMailGenContent(
                user.username,//username
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`//verificationURL
            )
        }
    )

    //get the createduser from the database without touching the provided list 
    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )// writing - will tell that I dont want these 


    //Lets verify 
    if (!CreatedUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }

    //send the response after successfull creation of the user
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: CreatedUser },
                "User registered Successfully and verification email has been sent on your email "
            )
        )

})

export { registerUser };