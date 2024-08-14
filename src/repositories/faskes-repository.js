import FaskesModel from "../models/faskes-model.js";
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