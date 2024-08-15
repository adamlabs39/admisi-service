import sequelizeInstance from "../configurations/sequelize-instance.js";
import FaskesSeeder from "./faskes-seeder.js";
import InsuranceAccountSeeder from "./insurance-account-seeder.js";

export const dbSeeder = async () => {
    const transaction = await sequelizeInstance.transaction();
    try {
        await FaskesSeeder.seed(transaction);
        await InsuranceAccountSeeder.seed(transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};