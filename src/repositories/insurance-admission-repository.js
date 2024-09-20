import {Model as InsuranceAdmission} from "sequelize";
import InsuranceAdmissionModel from "../models/insurance-admission-model.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";

export default class InsuranceAdmissionRepository{
    static async upsertInsuranceAdmission(data, transaction) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        const trx = transaction || await sequelizeInstace.transaction();

        try {
            const insuranceAdmission = await InsuranceAdmissionModel.findOne({
                where: { admissionType: data.admissionType, noReg: data.noReg, faskesUuid }
            });

            const result = insuranceAdmission
                ? await insuranceAdmission.update(data, { transaction: trx })
                : await InsuranceAdmissionModel.create({ ...data, faskesUuid }, { transaction: trx });

            if (!transaction) await trx.commit();
            return result;
        } catch (e) {
            if (!transaction) await trx.rollback();
            throw e;
        }
    }
}