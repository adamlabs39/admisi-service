import successResponse from "../responses/success-response.js";
import ExportReportService from "../services/export-report-service.js";

export default class ExportReportController {
    static async getExportKunjungan(req,res,next){
        try{
            const result = await ExportReportService.getExportKunjungan();
            return res.status(200).json(successResponse("Data Export Kunjungan berhasil ditampilkan", result));
        }catch (error){
            next(error);
        }
    }
}