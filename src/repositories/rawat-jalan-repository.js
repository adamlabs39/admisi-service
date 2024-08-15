import PatientModel from "../models/patient-model.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import InsuranceAdmissionModel from "../models/insurance-admission-model.js";
import {convertCamelToSnake} from "../helper/utility.js";

export default class RawatJalanRepository {
    static async getAll(args) {
        const ctx = Ctx.get(CTX_AUTHOR);
        const filter = {
            faskesUuid: ctx.faskesUuid,
            name: {
                [Op.like]: `%${args.name || ""}%`
            },
            // TODO : Add more filter By Payment method, poli, etc
        };
        return await Pagination.do(
            PatientModel,
            args,
            filter,
        );
    }

    static async getOne(uuid) {
        try {
            return await PatientModel.findOne({
                where: {
                    [Op.and]: [
                        {uuid},
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                }
            })
        } catch (error) {
            throw error;
        }
    }


    static async registTunai(data) {
        try {
            return await sequelizeInstace.transaction(async (t) => {
                data.paymentMethod = 1;
                return await RawatJalanModel.create(data, {transaction: t});
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async registAsuransi(data) {
        try {
            return await sequelizeInstace.transaction(async (t) => {
                const ctx = Ctx.get(CTX_AUTHOR);
                data.paymentMethod = 2;

                const regist = await RawatJalanModel.create(data, {
                    transaction: t,
                    returning: true
                });

                const asuransi = await InsuranceAdmissionModel.create({
                    faskesUuid: ctx.faskesUuid,
                    noReg: regist.noReg,
                    insuranceAccountUuid: data.insurance,
                }, { transaction: t });

                return convertCamelToSnake({
                    ...regist.get(),
                    insurance: convertCamelToSnake(asuransi.get())
                });
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}