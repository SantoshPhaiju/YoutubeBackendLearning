import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper";
import { Subscription } from "../models/subscription.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";


export const subscribeChannel = asyncWrapper(
    async (req: Request, res: Response) => {
        const {channel_id} = req.params;

        const existingSubscription = await Subscription.findOne({
            channel: channel_id,
            subscriber: req.user._id
        });

        if (existingSubscription) {
            throw new ApiError(400, 'You are already subscribed to this channel');
        }

        const subscription = await Subscription.create({
            channel: channel_id,
            subscriber: req.user._id
        });

        console.log('subscription', subscription);

        res.status(201).json(
            new ApiResponse(200, 'Successfully subscribed to channel', subscription)
        )
    }
)