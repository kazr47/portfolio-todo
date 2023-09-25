//utils/createError.js作る
//routes整理

import express from "express";
import mongoose from "mongoose";
import "dotenv/config"
import router from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3001; // Get the port number from environment variables or use the default (3001)


// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB!"))
    .catch((err) => console.error("Error while connecting to MongoDB:", err));
    
// Middleware configuration
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs"); // Set EJS as the view engine

// Routes
app.use(router);

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});