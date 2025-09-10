if (process.env.VERCEL !== "1") {
  import("dotenv").then((dotenv) => {
    dotenv.config({
      path: path.resolve(__dirname, "../.env.local"),
    });
  });
}
import app from "./app";
import type { Request, Response } from "express";

import connectDB from "./db/index";
import path from "path";

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

export default app;
