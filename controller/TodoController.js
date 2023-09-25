import express from "express";
import cookieParser from "cookie-parser";

import { TodoModel, UserModel } from "../models/Todo.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Endpoint to fetch and display all Todos
// Need authenticateToken
const showTodo = async (req, res) => {
    try {
        // const allTodo = await TodoModel.find()
        const userTodo = await TodoModel.find({ userId: req.user.userId })
        res.render("index", { todo: userTodo })
    } catch (err) {
        console.error("Error while fetching user's todos:", err);
        res.status(500).send("Internal Server Error");
    }
};


// Endpoint to add a new Todo
// Need authenticateToken
const addTodo = async (req, res) => {
    try {
        const todo = req.body.todo;
        const user = req.user.userId;
        if (!todo) {
            return;
            // todo フィールドが空でないことを確認
        }
        console.log(todo)
        const newTodo = new TodoModel({ todo: todo, userId: user });

        await newTodo.save();
        console.log("Successfully added todo!");
        res.redirect("/todo");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// Endpoint to delete a Todo

const deleteTodo = async (req, res) => {
    try {
        const { _id } = req.params
        await TodoModel.deleteOne({ _id })
        console.log("Successfully deleted todo!")
        res.redirect("/todo");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

export { showTodo, addTodo, deleteTodo };