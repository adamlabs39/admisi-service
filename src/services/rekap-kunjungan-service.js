import RekapKunjunganRepository from "../repositories/rekap-kunjungan-repository.js";

export default class RekapKunjunganService {
    static async getRekapJenisKunjungan(args) {
        const result = await RekapKunjunganRepository.getRekapJenisKunjungan(args);
        if(!result) throw new Error("Gagal mengambil rekap kunjungan");
        return result;
    }
}