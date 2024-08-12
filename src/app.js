import express from "express";
import errorMiddleware from "./middlewares/error-middleware.js";
import 'dotenv/config';
import morgan from 'morgan';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import MODELMERGE from "./models/modelMerge.js";

const app = express();
const port = process.env.APP_PORT || 8080;
const host = process.env.APP_HOST || 'localhost';
const logger = morgan('dev');

// --------------------------------------------------------------------------
// Register Middleware
// --------------------------------------------------------------------------
app.use(express.json());
// app.use(routes);
app.use(errorMiddleware);
app.use(logger);

// --------------------------------------------------------------------------
// Security Middleware
// --------------------------------------------------------------------------

app.use(helmet());

const corsConfig = {
    origin: "*", // In production, restrict this to specific domains
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsConfig));
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 5 minutes"
});
app.use(limiter);

// --------------------------------------------------------------------------
// Start the Server
// --------------------------------------------------------------------------
app.listen(port, host, async () => {
    if (process.env.SYNC_DB === "true") {
        try {
            for (const model of MODELMERGE) {
                await model.sync({ alter: true });
            }
            console.log("Database synchronized successfully.");
        } catch (error) {
            console.error("Failed to synchronize the database:", error);
        }
    }
    console.log(`Server running on http://${host}:${port}`);
});
