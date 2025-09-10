import dotenv from "dotenv";
import { app } from "./app.js";
import type { Request, Response } from "express";

dotenv.config({
  path: "./.env.local",
});
import connectDB from "./db/index.js";
connectDB()
  .then(() => {
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World");
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed! ", err);
  });
