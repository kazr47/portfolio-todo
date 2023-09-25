import express from "express";
import cookieParser from "cookie-parser";

import { TodoModel } from "../models/Todo.js";
import errorHandler from "../middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());


// ユーザーに関連するTodoを取得し表示するエンドポイント（authenticateTokenが必要）
const showTodo = async (req, res) => {
    try {
        const userTodo = await TodoModel.find({ userId: req.user.userId });
        res.render("todo", { todo: userTodo });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// 新しいTodoを追加するエンドポイント（authenticateTokenが必要）
const addTodo = async (req, res) => {
    try {
        const { todo } = req.body;
        const userId = req.user.userId;

        if (!todo) {
            return;
        }

        const newTodo = new TodoModel({ todo, userId });
        await newTodo.save();

        console.log("Successfully added todo!");
        res.redirect("/todo");
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Todoを削除するエンドポイント
const deleteTodo = async (req, res) => {
    try {
        const { _id } = req.params;
        await TodoModel.deleteOne({ _id });
        console.log("Successfully deleted todo!");
        res.redirect("/todo");
    } catch (error) {
        errorHandler(error, req, res);
    }
};

export { showTodo, addTodo, deleteTodo };
