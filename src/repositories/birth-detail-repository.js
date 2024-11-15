import SequelizeInstance from "../configurations/sequelize-instance.js";
import {
    BirthDetailModel
} from "@adameds/model-sdk/admisi";
import {Op} from "sequelize";
export default class BirthDetailRepository {
    static async create(data){
        try{
            return await SequelizeInstance.transaction(async (t) => {
                return await BirthDetailModel.create(data, {transaction: t});
            });
        }catch (error){
            console.log(error);
            throw error;
        }
    }

    static async update(uuid, data){
        return await SequelizeInstance.transaction(async (t) => {
            const [affectedCount, updatedBirthDetails] = await BirthDetailModel.update(data, {
                where: {
                    [Op.and]: [
                        {uuid},
                        {
                            deletedAt: {
                                [Op.is]: null,
                            },
                        },
                    ],
                },
                returning: true,
                plain: false,
                transaction: t,
            });
            return affectedCount > 0 ? updatedBirthDetails[0] : null;
        });
    }
}