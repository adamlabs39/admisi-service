import {
    PractitionerModel
} from "@adameds/model-sdk/datamaster";
import NotfoundException from "../exception/notfound-exception.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";

export default class PractitionerRepository {
    static async getPractitionerBy(col = 'uuid', val) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const data = await PractitionerModel.findOne({
            where: {
                [col]: val,
                faskesUuid
            }
        });
        if (!data) throw new NotfoundException(`Practitioner not found`);
        return data;
    }

}