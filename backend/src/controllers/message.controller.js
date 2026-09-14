import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    sendMessage,
    getConversationMessages,
} from "../services/message.service.js";


/**
 * Send a message in a conversation.
 */
export const createMessage =
    asyncHandler(async (req, res) => {
        const message =
            await sendMessage(
                req.params.conversationId,
                req.user._id,
                req.body.content
            );

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    message,
                },
                "Message sent successfully"
            )
        );
    });


/**
 * Get messages from a conversation.
 */
export const getMessages =
    asyncHandler(async (req, res) => {
        const result =
            await getConversationMessages(
                req.params.conversationId,
                req.user._id,
                req.validatedQuery
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Messages fetched successfully"
            )
        );
    });