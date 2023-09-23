import express from "express"
import TodoModel from "../models/Todo.js";
const router = express.Router();
const app = express();
app.use(express.json())


router.get("/", (req, res) => {
    res.render("index")
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

export default router
