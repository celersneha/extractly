import path from "path";
import dotenv from "dotenv";
// Local dev mein dotenv config karo
if (process.env.VERCEL !== "1") {
  dotenv.config({
    path: path.resolve(__dirname, "../.env.local"),
  });
}

import app from "./app";
import type { Request, Response } from "express";
import connectDB from "./db/index";

connectDB()
  .then(() => {
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World");
    });

    // Vercel pe listen mat karo
    if (process.env.VERCEL !== "1") {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log("MONGO DB connection failed! ", err);
  });

export default app;
