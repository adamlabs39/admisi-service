import HomeService from "../services/home-service.js";

export default class HomeController {
    static async home(req, res, next){
        try{
            const name = req.query.name;
            const result = await HomeService.home();
            res.status(200).json(result + " " + name);
        }catch(error){
            next(error);
        }
    }
}