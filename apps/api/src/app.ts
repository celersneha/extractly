import express from "express";
import cors from "cors";

const app = express();
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

//routes import
import invoiceRoutes from "./routes/invoice.routes.js";

//routes declaration
app.use("/api/v1", invoiceRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
