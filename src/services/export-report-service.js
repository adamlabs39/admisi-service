import ExportReportRepository from "../repositories/export-report-repository.js";

export default class ExportReportService {
    static async getExportKunjungan(args){
        const result = await ExportReportRepository.getExportKunjungan(args);
        if(!result) throw new Error("Gagal mengambil export kunjungan");
        return result;
    }
    
    static async getExportBatalKunjungan(){
        const result = await ExportReportRepository.getExportBatalKunjungan();
        if(!result) throw new Error("Gagal mengambil export batal kunjungan");
        return result;
    }
}