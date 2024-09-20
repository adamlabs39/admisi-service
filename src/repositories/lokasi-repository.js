import LokasiModel from "../models/lokasi-model.js";
import NotfoundException from "../exception/notfound-exception.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";

export default class LokasiRepository {
    static async getLokasiBy(col = 'uuid', val) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const data = await LokasiModel.findOne({
            where: {
                [col]: val,
                faskesUuid
            }
        });
        if (!data) throw new NotfoundException(`Lokasi not found`);
        return data;
    }

}