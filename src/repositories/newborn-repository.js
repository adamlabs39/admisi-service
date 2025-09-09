import sequelizeInstace from "../configurations/sequelize-instance.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {convertSnakeToCamel} from "../helper/utility.js";
import {Op, where} from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import {
    NewBornModel,
    BirthDetailModel,
    PatientModel
} from "@adameds/model-sdk/admisi";
import {
    AddressModel
} from "@adameds/model-sdk/setting";
import Pagination from "../helper/pagination.js";
import { LogPelayananModel } from "@adameds/model-sdk/pelayanan";
import { newBornFilter } from "./filters/report-filter.js";
import { newBornInclude } from "./include/report-include.js";

BirthDetailModel.hasOne(PatientModel, {
    foreignKey: "birth_detail_uuid",
    as: "patient",
});

PatientModel.hasOne(LogPelayananModel, {
    foreignKey: "patient_uuid",
    as: "log_pelayanan",
});

export default class newBornRepository {
    static async upsertNewBorn(data, transaction = null) {
        const trx = transaction || await sequelizeInstace.transaction();
        const user = Context.get(CTX_AUTHOR);
        data = convertSnakeToCamel(data);
        try {
            const noRmBaby = data.noRmBaby || null;
            let newBorn = noRmBaby ? await this.findByNoRm(noRmBaby, trx) : null;
            data.faskesUuid = user.faskesUuid;
            if (newBorn) {
                await newBorn.update(data, {transaction: trx});
            } else {
                newBorn = await NewBornModel.create(data, {transaction: trx});
            }

            if (!transaction) await trx.commit();
            return newBorn;
        } catch (error) {
            if (!transaction) await trx.rollback();
            throw error;
        }
    }

    static async findByNoRm(noRmBaby, transaction) {
        return await NewBornModel.findOne({
            where: {
                noRmBaby,
                deletedAt: null
            },
            transaction
        });
    }


    static async getReportNewBorn(args) {
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        try {
            const filter = newBornFilter({faskesUuid, args, options: {}});

            const options = {
                include: newBornInclude,
                attributes: [
                    "uuid", "identifier_mom", "name_mom", "name_baby", "no_rm_baby", "birth_time_baby", "gender_baby", "multiple_birth", "tanggal_daftar"
                ],
            }

            return await Pagination.init(
                NewBornModel,
                args,
                filter,
                options,
            )
        } catch (e) {
            console.log("Error on getReportNewBorn");
            console.log(e);
            throw e;
        }
    }
}
