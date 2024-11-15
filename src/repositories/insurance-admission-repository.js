import {
    InsuranceAdmissionModel
} from "@adameds/model-sdk/pelayanan";
import {
    PenjaminModel
} from "@adameds/model-sdk/datamaster";
import {
    InsuranceAccountModel
} from "@adameds/model-sdk/admisi";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import NotfoundException from "../exception/notfound-exception.js";

export default class InsuranceAdmissionRepository {
    static async upsertInsuranceAdmission(data, transaction) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const trx = transaction || await sequelizeInstace.transaction();

        try {
            const insuranceAdmission = await InsuranceAdmissionModel.findOne({
                where: {
                    admissionType: data.admissionType,
                    noReg: data.noReg,
                    faskesUuid
                }
            });

            const result = insuranceAdmission
                ? await insuranceAdmission.update(data, {transaction: trx})
                : await InsuranceAdmissionModel.create({...data, faskesUuid}, {transaction: trx});

            if (!transaction) await trx.commit();
            return result;
        } catch (e) {
            if (!transaction) await trx.rollback();
            throw e;
        }
    }

    static async AsuransiPelayanan(data, transaction) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        const trx = transaction || await sequelizeInstace.transaction();

        try {
            const AccountInsurance = await this.GenerateAccountInsurance(data, trx);
            const insuranceAdmission = await this.upsertInsuranceAdmission({
                admissionType: data.admissionType,
                noReg: data.noReg,
                insuranceAccountUuid: AccountInsurance,
                faskesUuid,
            }, trx);

            if (!transaction) await trx.commit();
            return insuranceAdmission.uuid;
        }catch (e) {
            if (!transaction) await trx.rollback();
            throw e;
        }
    }


    static async GenerateAccountInsurance(data, transaction) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        const trx = transaction || await sequelizeInstace.transaction();
        try {
            const penjamin = await PenjaminModel.findOne(
                {
                    where: {
                        uuid: data.penjaminUuid,
                    }
                }
            );
            if(!penjamin) throw new NotfoundException('Penjamin tidak ditemukan');

            let insuranceAccount = await InsuranceAccountModel.findOne({
                where: {
                    accountNumber: data.accountNumber,
                    patientUuid: data.patientUuid,
                    faskesUuid: faskesUuid,
                },
            });

            if (insuranceAccount) {
                await insuranceAccount.update({
                    code: penjamin.code,
                    name: penjamin.name,
                    classEntitle: data.classEntitle,
                    membership_status: true,
                    status: true,
                });
            } else {
                insuranceAccount = await InsuranceAccountModel.create({
                    faskesUuid,
                    patientUuid: data.patientUuid,
                    code: penjamin.code,
                    name: penjamin.name,
                    accountNumber: data.accountNumber,
                    classEntitle: data.classEntitle,
                    membership_status: true,
                    status: true,
                });
            }

            if (!transaction) await trx.commit();

            return insuranceAccount.uuid;
        } catch (e) {
            if (!transaction) await trx.rollback();
            throw e;
        }
    }
}