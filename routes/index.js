import express from "express";
import bcrypt from "bcrypt"
import { TodoModel, UserModel } from "../models/Todo.js";
import jwt from "jsonwebtoken"
// import { JsonWebTokenError } from "jsonwebtoken";

const router = express.Router();
const app = express();
app.use(express.json());

// Endpoint to display the login page

router.get("/", async (req, res) => {
    try {
        const allLogin = await UserModel.find();
        res.render("login");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // ユーザー名が既に存在するかチェック
        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).send('Username already in use😭');
        }

        // パスワード hash 化
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new UserModel({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// ユーザーログインエンドポイント
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ユーザーデータを取得
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        // パスワードの比較
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid username or password');
        }


        // // ログイン成功時に JWT を生成
        // const jwtSecret = 'your-secret-key'; // 秘密鍵を設定
        // const userId = user._id; // ユーザーIDを取得
        // const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '10m' }); // トークンを生成

        
        // "/todo" にユーザーIDをパラメータとしてリダイレクト
        res.redirect(`/todo/${user._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to fetch and display all Todos
router.get("/todo/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // 特定のユーザーに関連するTodoのみを取得
        const userTodos = await TodoModel.find({ userId });

        res.render("index", { todo: userTodos });
    } catch (err) {
        console.error("Error while fetching user's todos:", err);
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint to add a new Todo
router.post("/add/todo", async (req, res) => {
    try {
        const { userId } = req.params;
        const { todo } = req.body;

        console.log("Received new todo:", todo);

        // ユーザーIDを指定して新しいTodoを作成
        const newTodo = new TodoModel({ userId, todo });
        await newTodo.save();

        console.log("Successfully added todo!");
        res.redirect(`/todo/${userId}`);
    } catch (err) {
        console.error("Error while adding todo:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to delete a Todo
router.get("/delete/todo/:_id", async (req, res) => {
    try {
        const { userId, _id } = req.params;

        // ユーザーIDとTodoのIDを指定してTodoを削除
        await TodoModel.deleteOne({ _id, userId });

        console.log("Successfully deleted todo!");
        res.redirect(`/todo/${userId}`);
    } catch (err) {
        console.error("Error while deleting todo:", err);
        res.status(500).send("Internal Server Error");
    }
});

export default router;