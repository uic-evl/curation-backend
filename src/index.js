import "dotenv/config";
import cors from "cors";
import express from "express";
const router = require("./router");

const app = express();
app.use(cors());

router(app);

app.listen(process.env.PORT, () => console.log("Loading express server..."));
