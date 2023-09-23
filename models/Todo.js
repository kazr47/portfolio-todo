import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true,
    }
})

const TodoModel = mongoose.model("Todos", TodoSchema);

export default TodoModel;