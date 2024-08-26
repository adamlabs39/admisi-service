import NewBornModel from "../models/new-born-model.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";

export default class newBornRepository {
    static async upsertNewBorn(data, transaction) {
        const trx = transaction || await sequelizeInstace.transaction();
        try {
            const uuid = data.uuid || null;
            let newBorn = uuid ? await this.findByUuid(uuid, trx) : null;

            if (newBorn) {
                await newBorn.update(data, { transaction: trx });
            } else {
                newBorn = await NewBornModel.create(data, { transaction: trx });
            }

            if (!transaction) await trx.commit();
            return newBorn;
        } catch (error) {
            if (!transaction) await trx.rollback();
            throw error;
        }
    }

    static async findByUuid(uuid, transaction) {
        return await NewBornModel.findOne({
            where: {
                uuid,
                deletedAt: null
            },
            transaction
        });
    }
}
