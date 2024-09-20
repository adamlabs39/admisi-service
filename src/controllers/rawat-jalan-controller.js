import {RawatJalanService} from "../services/rawat-jalan-service.js";
import successResponse from "../responses/success-response.js";

export default class RawatJalanController {
    static async getAll(request, response, nextFunction) {
        try {
            const rawatJalan = await RawatJalanService.getALl(request.query);
            console.log(response.locals.jwtData)
            return response.status(200).json(successResponse(
                "Data Rawat Jalan Berhasil Ditampilkan",
                rawatJalan.data,
                rawatJalan.pagination
            ));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async registRawatJalan(request, response, nextFunction) {
        try {
            const data = await RawatJalanService.registRawatJalan(request.body);
            return response.status(201).json(successResponse("Rawat Jalan Berhasil Dibuat", data));
        } catch (error) {
            nextFunction(error);
        }
    }

    static async updateRawatJalan(request, response, nextFunction) {
        try{
            const data = await RawatJalanService.updateRawatJalan(request.params.uuid, request.body);
            return response.status(200).json(successResponse("Data Rawat Jalan Berhasil Diupdate", data));
        }catch (error){
            nextFunction(error);
        }
    }

    static async cancelVisitRawatJalan(request, response, nextFunction) {
        try {
            const data = await RawatJalanService.cancelVisit(request.body);
            return response.status(200).json(successResponse("Data Rawat Jalan Berhasil Dibatalkan"));
        } catch (error) {
            nextFunction(error);
        }
    }


    static async getDetail(req, res, next) {
        try{
            const data = await RawatJalanService.getDetail(req.params.uuid);
            return res.status(200).json(successResponse("Data Rawat Jalan Berhasil Ditampilkan", data));
        }catch (error){
            next(error);
        }
    }
}