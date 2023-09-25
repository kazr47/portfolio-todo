import express from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

import { TodoModel, UserModel } from "../models/Todo.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Endpoint to display the login page

const redirectIfAuthenticated = async (req, res) => {
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
}

const userRegistration = async (req, res) => {
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
        res.send('<div><h1>User registered successfully</h1><a href="/">Back</a></div>');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// ユーザーログインエンドポイント
const userLogin = async (req, res) => {
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
};


const userLogout = (req, res) => {
    res.clearCookie("jwtToken");
    res.redirect("/");
    res.status(200).send("Logout Success")
}

const userIsLoggedIn = (req, res) => {
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
    }

export {redirectIfAuthenticated, userRegistration, userLogin, userLogout, userIsLoggedIn};