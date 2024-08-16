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
            return response.status(201).json({
                message: "Data Rawat Jalan Berhasil Ditambahkan",
                data
            });
        }catch (error) {
            nextFunction(error);
        }
    }
}