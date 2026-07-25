import User from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Account already exists");
    }

    const user = new User({name, email, password});

    await user.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            "Account created successfully"
        )
    );
});