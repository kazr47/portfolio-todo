import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { UserModel } from "../models/Todo.js";
import errorHandler from "../middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// ログインページを表示するエンドポイント
const redirectIfAuthenticated = async (req, res) => {
    try {
        const token = req.cookies.jwtToken;
        if (token) {
            res.redirect("/todo");
        } else {
            res.render("login");
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// ユーザー登録エンドポイント
const userRegistration = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).send('Username already in use😭');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new UserModel({
            username: username,
            password: hashedPassword,
        });

        await newUser.save();
        res.send('<div><h1>User registered successfully</h1><a href="/">Back</a></div>');
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// ユーザーログインエンドポイント
const userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid username or password');
        }

        const payload = {
            userId: user._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwtToken', token, { maxAge: 3600000, httpOnly: true });
        res.redirect(`/todo`);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// ユーザーログアウトエンドポイント
const userLogout = (req, res) => {
    try {
        res.clearCookie("jwtToken");
        res.redirect("/");
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// ユーザーのログイン状態を確認するエンドポイント
const userIsLoggedIn = (req, res) => {
    try {
        const token = req.cookies.jwtToken;
        if (!token) {
            return res.json(false);
        }
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (err) {
                return res.json(false);
            }
            return res.json(true);
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

export {
    redirectIfAuthenticated,
    userRegistration,
    userLogin,
    userLogout,
    userIsLoggedIn,
};
