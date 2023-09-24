import express from "express";
import bcrypt from "bcrypt"
import { TodoModel, UserModel } from "../models/Todo.js";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(express.json());
app.use(cookieParser());


// JWTのシークレットキーを設定
const secretKey = 'your-secret-key';



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

        // ログイン成功時にJWTトークンを生成
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' }); // トークンの有効期限を設定 (1時間)

        // JWTトークンをCookieに設定
        res.cookie('jwtToken', token, { maxAge: 3600000, httpOnly: true }); // 1時間の有効期限を設定

        // console.log(token);


        // "/todo" にリダイレクト
        res.redirect(`/todo`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to fetch and display all Todos
router.get("/todo", async (req, res) => {
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
        res.redirect(`/todo`);
    } catch (err) {
        console.error("Error while adding todo:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to delete a Todo
router.get("/delete/todo/:_id", async (req, res) => {
    try {
        const { _id } = req.params;

        // ユーザーIDとTodoのIDを指定してTodoを削除
        await TodoModel.deleteOne({ _id });

        console.log("Successfully deleted todo!");
        res.redirect(`/todo`);
    } catch (err) {
        console.error("Error while deleting todo:", err);
        res.status(500).send("Internal Server Error");
    }
});

export default router;