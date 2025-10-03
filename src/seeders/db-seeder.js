import sequelizeInstance from "../configurations/sequelize-instance.js";
import FaskesSeeder from "./faskes-seeder.js";
import InsuranceAccountSeeder from "./insurance-account-seeder.js";
import RoomsSeeder from "./rooms-seeder.js";
import LokasiSeeder from "./lokasi-seeder.js";
import PractitionerSeeder from "./practitioner-seeder.js";
import JadwalDokterSeeder from "./jadwal-dokter-seeder.js";
import PegawaiSeeder from "./pegawai-seeder.js";
import PenjaminSeeder from "./penjamin-seeder.js";
import PatientSeeder from "./patient-seeder.js";
import RawatJalanSeeder from "./rawat-jalan-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {
        // await FaskesSeeder.seed(transaction);
        // await InsuranceAccountSeeder.seed(transaction);
        // await RoomsSeeder.seed(transaction);
        // await LokasiSeeder.seed(transaction);
        // await PegawaiSeeder.seed(transaction);
        // await PractitionerSeeder.seed(transaction);
        // await JadwalDokterSeeder.seed(transaction);
        // await PenjaminSeeder.seed(transaction);
        await PatientSeeder.seed(transaction);
        await RawatJalanSeeder.seed(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};