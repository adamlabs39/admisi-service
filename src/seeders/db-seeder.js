import sequelizeInstance from "../configurations/sequelize-instance.js";
import FaskesSeeder from "./faskes-seeder.js";
import InsuranceAccountSeeder from "./insurance-account-seeder.js";
import RoomsSeeder from "./rooms-seeder.js";
import LokasiSeeder from "./lokasi-seeder.js";
import PractitionerSeeder from "./practitioner-seeder.js";
import AntrianPoliSeeder from "./antrian-poli-seeder.js";
import JadwalDokterSeeder from "./jadwal-dokter-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {
        await FaskesSeeder.seed(transaction);
        await InsuranceAccountSeeder.seed(transaction);
        await RoomsSeeder.seed(transaction);
        await LokasiSeeder.seed(transaction);
        await PractitionerSeeder.seed(transaction);
        await AntrianPoliSeeder.seed(transaction);
        await JadwalDokterSeeder.seed(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};