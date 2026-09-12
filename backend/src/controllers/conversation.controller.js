import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    createConversation,
    getUserConversations,
    getConversationById,
} from "../services/conversation.service.js";


/**
 * Create a conversation with an accepted connection.
 */
export const createConversationController =
    asyncHandler(async (req, res) => {
        const conversation =
            await createConversation(
                req.user._id,
                req.params.userId
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    conversation,
                },
                "Conversation created successfully"
            )
        );
    });


/**
 * Get conversations belonging to the authenticated user.
 */
export const getMyConversations =
    asyncHandler(async (req, res) => {
        const result =
            await getUserConversations(
                req.user._id,
                req.validatedQuery
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Conversations fetched successfully"
            )
        );
    });


/**
 * Get a specific conversation.
 */
export const getConversation =
    asyncHandler(async (req, res) => {
        const conversation =
            await getConversationById(
                req.params.conversationId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    conversation,
                },
                "Conversation fetched successfully"
            )
        );
    });