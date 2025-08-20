import successResponse from "../responses/success-response.js";
import ExportReportService from "../services/export-report-service.js";

export default class ExportReportController {
    static async getExportKunjungan(req,res,next){
        try{
            const result = await ExportReportService.getExportKunjungan(req.query);
            return res.status(200).json(successResponse("Data Export Kunjungan berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }

    static async getExportBatalKunjungan(req,res,next){
        try{
            const result = await ExportReportService.getExportBatalKunjungan(req.query);
            return res.status(200).json(successResponse("Data Export Batal Kunjungan berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }

    static async getExportStatusKamar(req,res,next){
        try{
            const result = await ExportReportService.getExportStatusKamar(req.query);
            return res.status(200).json(successResponse("Data Export Status Kamar berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }

    static async getExportKeperawatanInap(req,res,next){
        try{
            const result = await ExportReportService.getExportKeperawatanInap(req.query);
            return res.status(200).json(successResponse("Data Export Keperawatan Inap berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }

    static async getExportNewBorn(req,res,next){
        try{
            const result = await ExportReportService.getExportNewBorn(req.query);
            return res.status(200).json(successResponse("Data Export New Born berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }
}