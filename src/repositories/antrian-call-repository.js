import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { InsuranceAccountModel, PatientModel } from "@adameds/model-sdk/admisi";
import { Op } from "sequelize";

export default class AntrianCallRepository {
    static async getAllAntrian(){
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        try {
            
            const filter = {
                faskesUuid,
                deletedAt: null,
                dischargeDate: null,
                noAntrianAdmisi: { [Op.not]: null },
                statusRj: [1, 2],
            };


            const antrian = await RawatJalanModel.findAll({
                where: {
                    ...filter
                },
                include: [
                    {
                        model: PatientModel,
                        as: "patient",
                        required: true,
                        attributes: [ "identity", "no_identity" ],
                        include: [
                            {
                                model: InsuranceAccountModel,
                                as: "insurance",
                                required: false,
                                attributes: [ "name", "account_number" ]
                            }
                        ]
                    }
                ],
                attributes: [ "name", "no_antrian_admisi", "kode_booking", "status_rj", "payment_method", "tanggal_daftar"],
                order: [["no_antrian_admisi", "ASC"]]
            });

            return antrian;
        }catch (error){
            console.log(error);
        }
    }


}