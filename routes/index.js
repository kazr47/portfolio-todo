import express from "express"
import TodoModel from "../models/Todo.js";
const router = express.Router();
const app = express();
app.use(express.json())


router.get("/", async (req, res) => {
    const allTodo = await TodoModel.find()
    res.render("index", { todo: allTodo })
})

router.post("/add/todo", async (req, res) => {
    try {
        const todo = req.body.todo;
        console.log(todo)
        const newTodo = new TodoModel({ todo });

        await newTodo.save();
        console.log("Successfully added todo!");
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/delete/todo/:_id", async (req, res) => {
    try {
        const { _id } = req.params
        await TodoModel.deleteOne({ _id })
        console.log("Successfully deleted todo!")
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router
