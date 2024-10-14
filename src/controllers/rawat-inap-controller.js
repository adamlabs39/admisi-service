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
            const data = await RawatInapService.update(req.params.uuid, req.body);
            return res.status(200).json(successResponse("Rawat Inap Berhasil Diupdate", data));
        }catch (e){
            next(e);
        }
    }

    static async getDetail(req, res, next){
        try{
            const data = await RawatInapService.getDetail(req.params.uuid);
            return res.status(200).json(successResponse("Detail Rawat Inap", data));
        }catch (e){
            next(e);
        }
    }

    static async getAll(req, res, next){
        try{
            const data = await RawatInapService.getAll(req.query);
            return res.status(200).json(successResponse("List Rawat Inap",
                data.data,
                data.pagination
            ));
        }catch (e){
            next(e);
        }
    }

    static async cancelVisitRawatInap(req, res, next){
        try{
            await RawatInapService.cancelVisitRawatInap(req.body);
            return res.status(200).json(successResponse("Rawat Inap Berhasil Dibatalkan"));
        }catch (e){
            next(e);
        }
    }
}