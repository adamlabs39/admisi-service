import successResponse from "../responses/success-response.js";
import AntrianCallService from "../services/antrian-call-service.js";

export default class AntrianCallController {
    static async getAllAntrianCall(req, res, next) {
        try {
            const result = await AntrianCallService.getAllAntrianCall(req.query);
            return res.status(200).json(successResponse("Data Antrian berhasil ditampilkan", result));
        }catch(error){
            next(error);
        }
    }

    static async updateAntrianCall(req, res, next){
        try {
            const result = await AntrianCallService.updateAntrianCall(req.params.uuid, req.body);
            return res.status(200).json(successResponse("Data Antrian berhasil diedit", result));
        }catch(error){
            next(error);
        }
    }
}