import {
    PatientFamilyModel
} from "@adameds/model-sdk/admisi";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";

export default class PatientFamilyRepository {
    static async create(data, transaction = null) {
        let t = transaction;
        try {
            const user = Context.get(CTX_AUTHOR);
            t = t || await sequelizeInstance.transaction();
            const patientFamily = await PatientFamilyModel.create({
                ...data,
                faskesUuid: user.faskesUuid
            }, {transaction: t, returning: true});

            if (!transaction) await t.commit();
            return patientFamily;
        } catch (error) {
            if (t && !transaction) await t.rollback();
            throw error;
        }
    }

}