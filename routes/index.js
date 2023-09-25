import express from "express";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(express.json());
router.use(cookieParser());

import { showTodo, addTodo, deleteTodo } from "../controller/TodoController.js"
import {redirectIfAuthenticated, userRegistration, userLogin, userLogout, userIsLoggedIn} from "../controller/UserController.js"
import authenticateToken from "../middlewares/authentication.js"

router.get("/", redirectIfAuthenticated)
router.post("/redister", userRegistration)
router.post("/login", userLogin)
router.get("/logout", userLogout)
router.get("/isLoggedIn", userIsLoggedIn)
router.get("/todo", authenticateToken, showTodo)
router.post("/add/todo", authenticateToken, addTodo)
router.get("/delete/todo/:_id", deleteTodo)

export default router;