import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
const router = require("./router");

const app = express();
app.use(cors());
app.use("/files", express.static(path.resolve(process.env.FILES_LOCATION)));

router(app);

app.listen(process.env.PORT, () => console.log("Loading express server..."));
