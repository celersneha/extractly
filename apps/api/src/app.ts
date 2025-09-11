import express from "express";
import cors from "cors";

const app = express();

// Log environment variables (remove in production)
console.log("Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  hasDBUrl: !!process.env.DATABASE_URL,
  hasOtherEnvs: Object.keys(process.env).filter((key) =>
    key.startsWith("YOUR_APP_PREFIX")
  ).length,
});

// Configure CORS properly
app.use(
  cors({
    origin: [
      "https://extractly-psi.vercel.app",
      "http://localhost:3000", // for local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

//routes import
import invoiceRoutes from "./routes/invoice.routes";

//routes declaration
app.use("/api/v1", invoiceRoutes);

// Add a simple health check or welcome route
app.get("/", (req, res) => {
  res.json({ message: "API deployed successfully!" });
});

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
