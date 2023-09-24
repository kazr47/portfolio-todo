import mongoose, { Schema } from "mongoose";

const TodoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {timestamps: true});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    }
})

const TodoModel = mongoose.model("Todos", TodoSchema);
const UserModel = mongoose.model("User", UserSchema);

export {TodoModel, UserModel};