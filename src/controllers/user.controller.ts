import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import asyncWrapper from '../utils/asyncWrapper';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { ApiResponse } from '../utils/ApiResponse';

export const registerUser = asyncWrapper(
    async (req: Request, res: Response) => {
        // * Getting all the data from the request body from frontend
        const { username, fullname, email, password } = req.body

        // * validating the data from the request body
        const validation = validationResult(req);
        console.log(validation);

        if (
            [fullname, email, username, password].some((field) => {
                return field?.trim() === '';
            })
        ) {
            let error = new ApiError(400, 'All fields are required');
            throw error;
        }

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
            throw new ApiError(500, 'Something went wrong while registering user');
        }

        // * Returning the reponse to the user
        res.status(201).json(
            new ApiResponse(201, 'User registered successfully', createdUser, true)
        );
    }
);
