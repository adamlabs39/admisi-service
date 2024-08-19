import NewBornModel from "../models/new-born-model.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";

export default class newBornRepository {
    static async registNewBorn(data) {
        try{
            return await sequelizeInstace.transaction(async (t) => {
                return await NewBornModel.create(data, {transaction: t});
            });
        }catch (error) {
            throw error;
        }
    }
}