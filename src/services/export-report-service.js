import ExportReportRepository from "../repositories/export-report-repository.js";

export default class ExportReportService {
    static async getExportKunjungan(){
        const result = await ExportReportRepository.getExportKunjungan();
        if(!result) throw new Error("Gagal mengambil export kunjungan");
        return result;
    }
}