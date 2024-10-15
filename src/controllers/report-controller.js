import ReportService from "../services/report-service.js";
import successResponse from "../responses/success-response.js";

export default class ReportController {
    static async getReport(req, res, next) {
        try {
            const data = await ReportService.getReport(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getReportPenjamin(req, res, next) {
        try {
            const data = await ReportService.getReportPenjamin(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getCancelVisitReport(req, res, next) {
        try {
            const data = await ReportService.getCancelVisitReport(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getReportRoom(req, res, next) {
        try {
            const data = await ReportService.getReportRoom(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getReportRawatInap(req, res, next) {
        try {
            const data = await ReportService.getKeperawatanInap(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    static async getReportNewBorn(req, res, next) {
        try {
            const data = await ReportService.getReportNewBorn(req.query);
            return res.status(200).json(successResponse("berhasil mendapatkan data",
                    data.data,
                    data.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

}