import express from "express"
import cors from "cors"
const app = express();

//basic configuration
app.use(express.json({ limit: "16kb" }))
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
)
app.use(express.static("public"))

//cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]
}))

//import the routes
import healthcheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.rotue.js";


app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);


app.get("/admin", (req, res) => {
    res.send("Hey,Hello how are you ??")
})

export default app;