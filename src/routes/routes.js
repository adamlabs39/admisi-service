import express from "express";
import AuthorizationMiddleware from "../middlewares/authorization-middleware.js";
const routes = express.Router();

routes.use(AuthorizationMiddleware);
routes.get("/", (req, res) => {
    res.json({message: "Hello World!"});
});
export default routes;