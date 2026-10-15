import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailGenContent, sendEmail } from "../utils/mail.js";
import { randomBytes, createHmac, createHash } from "crypto"


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

    user.emailVerificationExpiry = undefined;
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



export { registerUser, login, logoutUser, getCurrentUser, verifyEmail };