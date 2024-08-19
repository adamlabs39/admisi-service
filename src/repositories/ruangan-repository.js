import RuanganModel from "../models/ruangan-model.js";
import NotfoundException from "../exception/notfound-exception.js";
import {Op} from "sequelize";
import KategoriRuanganModel from "../models/kategori-ruangan-model.js";

export default class RuanganRepository {
    static async getById(uuid){
        const data = await RuanganModel.findOne({
            where: {
                uuid,
                deletedAt: { [Op.is]: null }
            },
            include:[
                {
                    model: KategoriRuanganModel,
                    required: true,
                    as: "kategori_ruangan",
                    attributes: [
                        "uuid",
                        "code",
                        "name",
                    ]
                }
            ]
        })

        if(!data) throw new NotfoundException("Room not found");

        return data;
    }
}