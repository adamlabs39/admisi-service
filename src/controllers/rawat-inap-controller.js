import RawatInapService from "../services/rawat-inap-service.js";
import successResponse from "../responses/success-response.js";

export default class RawatInapController{
    static async regist(req, res, next){
        try{
            const data = await RawatInapService.registRI(req.body);
            return res.status(201).json(successResponse("Rawat Inap Berhasil Dibuat", data));
        }catch (error) {
            next(error);
        }
    }

    static async update(req, res, next){
        try{

        }catch (e){
            
        }
    }
}