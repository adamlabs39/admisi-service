import successResponse from "../responses/success-response.js";
import AntrianCallService from "../services/antrian-call-service.js";

export default class AntrianCallController {
    static async getAllAntrian(req, res, next) {
        try {
            const result = await AntrianCallService.getAllAntrian();
            return res.status(200).json(successResponse("Data Antrian berhasil ditampilkan", result));
        }catch(error){
            next(error);
        }
    }
}