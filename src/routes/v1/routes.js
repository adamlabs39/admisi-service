import express from "express";
import HomeController from "../controllers/home-controller.js";
import ProductController from "../controllers/product-controller.js";

const routes = express.Router();
routes.get("/home", HomeController.home);
routes.get("/product/:uuid", ProductController.findByuuid);

export default routes;