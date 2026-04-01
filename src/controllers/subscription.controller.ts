import { Request, Response } from 'express';
import { Subscription } from '../models/subscription.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import asyncWrapper from '../utils/asyncWrapper';

export const subscribeChannel = asyncWrapper(
    async (req: Request, res: Response) => {
        const { channel_id } = req.params;

        if (req.user._id.toString() === channel_id) {
            throw new ApiError(400, 'You cannot subscribe to yourself');
        }

        const existingSubscription = await Subscription.findOne({
            channel: channel_id,
            subscriber: req.user._id,
        });

        if (existingSubscription) {
            const subscription = await Subscription.findByIdAndDelete(existingSubscription._id);
            res.status(200).json(new ApiResponse(
                200,
                "Channel unsubscribed successfully",
                null
            ));
            return;
            // throw new ApiError(
            //     400,
            //     'You are already subscribed to this channel'
            // );
        }

        const subscription = await Subscription.create({
            channel: channel_id,
            subscriber: req.user._id,
        });

        res.status(200).json(
            new ApiResponse(
                200,
                'Successfully subscribed to channel',
                subscription
            )
        );
    }
);
