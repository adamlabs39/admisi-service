import InstallasiGawatDaruratService from "../services/installasi-gawat-darurat-service.js";
import successResponse from "../responses/success-response.js";

export default class InstalasiGawatDaruratController{
    static async registIgd(req, res, next){
        try{
            const result = await InstallasiGawatDaruratService.registIGD(req.body);
            return res.status(201).json(successResponse("Berhasil membuat data IGD", result));
        }catch (error){
            next(error);
        }
    }

    static async updateIgd(req, res, next){
        try{
            const result = await InstallasiGawatDaruratService.updateIGD(req.params.uuid, req.body);
            return res.status(200).json(successResponse("Berhasil mengupdate data IGD", result));
        }catch (error){
            next(error);
        }
    }

    static async getAll(req,res,next) {
        try {
            const result = await InstallasiGawatDaruratService.getAll(req.query);
            return res.status(200).json(successResponse("Data IGD berhasil ditampilkan",
                result.data,
                result.pagination
            ));
        }catch (error){
            next(error);
        }
    }


    static async cancelVisitIgd(req, res, next){
        try{
            await InstallasiGawatDaruratService.cancelVisit(req.body);
            return res.status(200).json(successResponse("Berhasil membatalkan data IGD"));
        }catch (error){
            next(error);
        }
    }

    static async getDetail(req, res, next){
        try{
            const result = await InstallasiGawatDaruratService.getDetail(req.params.uuid);
            return res.status(200).json(successResponse("Detail data IGD", result));
        }catch (error){
            next(error);
        }
    }
}