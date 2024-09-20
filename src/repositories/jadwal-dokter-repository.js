import JadwalDokterModel from "../models/jadwal-dokter-model.js";
import NotfoundException from "../exception/notfound-exception.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {Context} from "../middlewares/context.js";

export default class JadwalDokterRepository{
    static async getJadwalBy(col = 'uuid', val) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const data = await JadwalDokterModel.findOne({
            where: {
                [col]: val,
                faskesUuid
            }
        });
        if (!data) throw new NotfoundException(`Jadwal Dokter not found`);
        return data;
    }
}