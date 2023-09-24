import express from "express";
import bcrypt from "bcrypt"
import { TodoModel, UserModel } from "../models/Todo.js";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(express.json());
router.use(cookieParser());

function authenticateToken(req, res, next) {
    const token = req.cookies.jwtToken; // クッキーからトークンを取得
  
    if (!token) {
      return res.status(401).send('Unauthorized'); // トークンがない場合は認証エラー
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Forbidden'); // トークンが無効な場合はアクセス拒否
      }
      req.user = user; // デコードされたユーザー情報をリクエストオブジェクトに追加
      next();
    });
  }

// Endpoint to display the login page

router.get("/", async (req, res) => {
    try {
        const token = req.cookies.jwtToken;
        if (token) {
        res.redirect("/todo");
          }else{
            res.render("login");
          }
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
            username: username,
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

        const payload = {
            userId: user._id,
        }
        // ログイン成功時にJWTトークンを生成
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // トークンの有効期限を設定 (1時間)

        // JWTトークンをCookieに設定
        res.cookie('jwtToken', token, { maxAge: 3600000, httpOnly: true }) // 1時間の有効期限を設定

        // console.log(token);


        // "/todo" にリダイレクト
        res.redirect(`/todo`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to fetch and display all Todos
router.get("/todo", authenticateToken, async (req, res) => {
    try {
        // const allTodo = await TodoModel.find()
        const userTodo = await TodoModel.find({ userId: req.user.userId})
        res.render("index", { todo: userTodo })
    } catch (err) {
        console.error("Error while fetching user's todos:", err);
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint to add a new Todo

router.post("/add/todo", authenticateToken, async (req, res) => {
    try {
        const todo = req.body.todo;
        const user = req.user.userId;
        console.log(todo)
        const newTodo = new TodoModel({ todo: todo, userId: user });

        await newTodo.save();
        console.log("Successfully added todo!");
        res.redirect("/todo");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint to delete a Todo

router.get("/delete/todo/:_id", async (req, res) => {
    try {
        const { _id } = req.params
        await TodoModel.deleteOne({ _id })
        console.log("Successfully deleted todo!")
        res.redirect("/todo");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("jwtToken");
    res.redirect("/");
    res.status(200).send("Logout Success")
})

router.get("/isLoggedIn", (req, res) => {
    const token = req.cookies.jwtToken
    if (!token) { 
        return res.json(false);
    }
    return jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            return res.json(false);
        }
        return res.json(true);
        })
    })

export default router;