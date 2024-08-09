import express from "express";
import routes from "./routes/routes.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import UserModel from "./models/user-model.js";
import 'dotenv/config';
import morgan from 'morgan';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';

const app = express();
const port = process.env.APP_PORT || 8080;
const logger = morgan('dev');

// --------------------------------------------------------------------------
// Register Middleware
// --------------------------------------------------------------------------

// Parse incoming JSON requests and attach the parsed data to req.body
app.use(express.json());

// Register application routes
app.use(routes);

// Register error handling middleware
app.use(errorMiddleware);

// Log incoming requests to the console for development and debugging
app.use(logger);

// --------------------------------------------------------------------------
// Security Middleware
// --------------------------------------------------------------------------

// Secure the application by setting various HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) with flexible configuration
const corsConfig = {
    origin: "*", // In production, restrict this to specific domains
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use(cors(corsConfig));

// Apply rate limiting to prevent abuse of API endpoints by limiting repeated
// requests from the same IP address within a specified time window.
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 5 minutes"
});
app.use(limiter);

// --------------------------------------------------------------------------
// Start the Server
// --------------------------------------------------------------------------

// Start the Express server and listen on the specified port.
app.listen(port, "localhost", async () => {
    if (process.env.WITH_SYNC_DB === 'true' && process.env.APP_MODE === 'DEVELOPMENT') {
        await UserModel.sync({ alter: false, force: true });
    }
    console.log(`Server running on http://localhost:${port}`);
});
