import {
    FaskesModel
} from "@adameds/model-sdk/datamaster";
import {Op} from "sequelize";

export default class FaskesRepository {
    static async getFaskesByUuid(uuid) {
        return await FaskesModel.findOne({
            where: {
                [Op.and]: [
                    { uuid },
                ]
            }
        });
    }
}