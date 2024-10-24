import { CookieOptions, Request, Response } from 'express';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';

const generateAccessAndRefreshToken = async (
    userId: string
): Promise<{
    accessToken: string;
    refreshToken: string;
}> => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false,
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating tokens');
    }
};

export const registerUser = asyncWrapper(
    async (req: Request, res: Response) => {
        // * Getting all the data from the request body from frontend
        const { username, fullname, email, password } = req.body;

        // * Checking if the user already exists
        const existedUser = await User.findOne({
            $or: [{ email: email }, { username: username }],
        });

        if (existedUser) {
            throw new ApiError(400, 'User already exists');
        }

        // * check for images, check for avatar
        let avatarLocalPath = '';
        let coverImageLocalPath = '';

        if (req.files && 'avatar' in req.files) {
            avatarLocalPath = req.files.avatar[0]?.path;
        }

        if (req.files && 'coverImage' in req.files) {
            coverImageLocalPath = req.files.coverImage[0]?.path;
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, 'Avatar is required');
        }

        // * Upload image to cloudinary, avatar
        const avatarCloudinaryUrl = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarCloudinaryUrl) {
            throw new ApiError(500, 'Failed to upload avatar image');
        }

        let coverImageCloudinaryUrl: string | null = '';
        if (coverImageLocalPath) {
            coverImageCloudinaryUrl =
                await uploadOnCloudinary(coverImageLocalPath);

            if (!coverImageCloudinaryUrl) {
                throw new ApiError(500, 'Failed to upload cover image');
            }
        }

        // * Creating a new user object
        const user = new User({
            username: username.toLowerCase(),
            fullname,
            avatar: avatarCloudinaryUrl,
            email,
            password,
            coverImage: coverImageCloudinaryUrl || null,
        });

        // * Saving the user to the database
        const newUser = await user.save();

        // * remove password and refresh token field from response
        const createdUser = await User.findById(newUser._id).select(
            '-password -refreshToken'
        );

        // * check for user creation
        if (!createdUser) {
            throw new ApiError(
                500,
                'Something went wrong while registering user'
            );
        }

        // * Returning the reponse to the user
        res.status(201).json(
            new ApiResponse(201, 'User registered successfully', createdUser)
        );
    }
);

export const loginUser = asyncWrapper(async (req: Request, res: Response) => {
    // * Getting all the data from the request body from frontend
    // * getting username or email and password from req.body
    // * Checking if the user exists
    // * Checking if the password is correct
    // * Generating the access token
    // * Generating the refresh token
    // * Saving the refresh token to the database
    // * Sending the response to the user

    const { username, email, password } = req.body;

    let user;

    if (!password) {
        throw new ApiError(400, 'Password is required');
    }

    if (username || email) {
        user = await User.findOne({
            $or: [{ username }, { email }],
        });
    } else {
        throw new ApiError(400, 'Username or email is required');
    }

    if (!user) {
        throw new ApiError(404, "User doesn't exists");
    }

    const comparePassword = await user.comparePassword(password);

    if (!comparePassword) {
        throw new ApiError(400, 'Invalid User Credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, 'User logged in successfully', {
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: loggedInUser,
            })
        );
});

export const logoutUser = asyncWrapper(async (req: Request, res: Response) => {
    const _id = req.user._id;
    const user = await User.findByIdAndUpdate(
        _id,
        {
            $set: { refreshToken: '' },
        },
        {
            new: true,
        }
    );

    const options: CookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, 'User logged out successfully', null));
});
