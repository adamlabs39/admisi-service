import successResponse from "../responses/success-response.js";
import RekapKunjunganService from "../services/rekap-kunjungan-service.js";

export default class RekapKunjunganController {
    static async getRekapKunjungan(req, res, next) {
        try {
            const result = await RekapKunjunganService.getRekapJenisKunjungan(req.query);
            return res.status(200).json(successResponse("Data Rekap Kunjungan berhasil ditampilkan", result));
        } catch (error) {
        next(error);
        }
    }
}