import NewBornModel from "../models/new-born-model.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {convertSnakeToCamel} from "../helper/utility.js";

export default class newBornRepository {
    static async upsertNewBorn(data, transaction) {
        const trx = transaction || await sequelizeInstace.transaction();
        const user = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            const noRmBaby = data.noRmBaby || null;
            let newBorn = noRmBaby ? await this.findByNoRm(noRmBaby, trx) : null;
            data.faskesUuid = user.faskesUuid;
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

    static async findByNoRm(noRmBaby, transaction) {
        return await NewBornModel.findOne({
            where: {
                noRmBaby,
                deletedAt: null
            },
            transaction
        });
    }
}
