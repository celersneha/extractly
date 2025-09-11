import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local for development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(__dirname, "../.env.local"),
  });
}

import app from "./app";
import connectDB from "./db/index";

const startServer = async () => {
  try {
    await connectDB();

    // Only start server locally, not on Vercel
    if (process.env.NODE_ENV === "development") {
      const port = process.env.PORT || 8000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;
