import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: 3,
        maxlength: 40,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please fill a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 8,
        select: false,
    },
    profilePic: {
        url: {
            type: String,
            default: null,
        },
        fileId: {
            type: String,
            default: null,
        }
    },
    bio: {
        type: String,
        maxlength: 150,
        trim: true,
    },
    interests: {
        type: [{
            type: String,
            trim: true
        }],
        validate: {
            validator: function (value) {
                return value.length <= 12;
            },
            message: "A user can have a maximum of 12 interests."
        }
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
        }
    }
}, {
    timestamps: true
});

userSchema.index({
    location: "2dsphere"
});

const User = mongoose.model('User', userSchema);
export default User;