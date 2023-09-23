import express from "express"
import mongoose from "mongoose";
import env from "dotenv"
import router from "./routes/index.js"


env.config();
const app = express();
const port = process.env.port || 3001


// conect to mongodb
mongoose
    .connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=> console.log("Connected to MongoDB!"))
    .catch((err) => console.log(err))
    
// middlewares
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

// routes
app.use(router);



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)

});
