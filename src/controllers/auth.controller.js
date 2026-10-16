import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailGenContent, forgotPasswordMailGenContent, sendEmail } from "../utils/mail.js";
import { randomBytes, createHmac, createHash } from "crypto"
import jwt from "jsonwebtoken"
import { kMaxLength } from "buffer";


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

    //save to the database using save method but no validate every field ok
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

//Your team need to figure it out that whether we provide you the username based login or email based or sometimes both
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(500, " email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "User doesnot exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Enter correct password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in Successfully"
            )
        )

})

//we can log out only if the user is logged in so in the route it self we run a middleware to fill the res.user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true //once every thing is done just give me most updated object even though we are not storing just wrote
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out Successfully")
        )
})

//get the current user info we will run the middleware to know whether user is logged in or not then only we get to know the user info
const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched succesfully"
            )
        )
})

//we learned something new just see the code you will understand 
const verifyEmail = asyncHandler(async (req, res) => {
    const verificationToken = req.params;

    if (!verificationToken) {
        throw new ApiError(401, "Email verification Token is missing")
    }

    const hashedToken = createHash('sha256').update(verificationToken).digest('hex')

    const user = await User.findOne(
        {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: Date.now() }
        }
    )

    if (!user) {
        throw new ApiError(200, "Verification token expired");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email verified Successfully"
            )
        )

})

const resendEmailVerification = asyncHandler(async (req, res) => {

    // const { unHashedToken, hashedToken, tokenExpiry } = req.user.generateTemporaryToken();

    // req.user.emailVerificationToken = hashedToken;
    // req.user.emailVerificationExpiry = tokenExpiry;

    // await req.user.save({ validateBeforeSave: false });

    // await req.user.sendEmail(
    //     {
    //         email: user?.email,
    //         subject: "Please verify the email",
    //         mailGenContent: emailVerificationMailGenContent(
    //             user.username,
    //              `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`//verificationURL
    //         )
    //     }
    // )

    const user = User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    //There is no point of doing the above 3 lines we can do it like commented part just for the reference i am writing this

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    //fill the fields of user provided by the user schema
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    //save to the database using save method but no validate every field ok
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

    res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Mail have been sent to your Email ID"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        //Refresh Token Rotation we are not using the refresh token to it's full potential
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false })

        return res.status(200)
            .cookie(accessToken, options)
            .cookie(newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

//forgot password we send email and we recieve a link to change a password 
const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(404, "User doesn't exists");
    }

    const user = User.findOne({ email: email })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verfiy your email",
            mailGenContent: forgotPasswordMailGenContent(
                user.username,//username
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`//verificationURL
            )
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset mail has been send on your mail ID"
            )
        )
})

//Here in this controller we actually write the logic how to change the password
const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = createHash("sha256")
        .update(resetToken)
        .digest('hex');

    const user = await User.findOne(
        {
            forgotPasswordToken: hashedToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        }
    )

    if (!user) {
        throw new ApiError(489, "Token is Invalid or expired")
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    //Dont worry about the hashing of password the PRE_HOOK will take care ok
    user.password = newPassword

    await user.save({ validateBeforeSave: false })


    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset Successfully"
            )
        )

})




export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword
};