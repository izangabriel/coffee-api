import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    address: [
        {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            isDefault: { type: Boolean, default: false }
        }
    ],

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;