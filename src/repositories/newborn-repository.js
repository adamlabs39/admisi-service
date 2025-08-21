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
            const filter = {
                faskesUuid,
                deletedAt: null,
                [Op.or]: [
                    {noRmBaby: {[Op.iLike]: `%${args.q}%`}},
                    {nameBaby: {[Op.iLike]: `%${args.q}%`}},
                    sequelizeInstance.where(
                        sequelizeInstance.col('address.full_address'),
                        {[Op.iLike]: `%${args.q || ''}%`}
                    ),
                ]
            };

            if (args.jenis_kunjungan) filter.jenis_kunjungan = sequelizeInstance.where(
                sequelizeInstance.col('birth_detail.patient.log_pelayanan.jenis_kunjungan'),
                { [Op.eq]: `${args.jenis_kunjungan}` }
            );

            const options = {
                include: [
                    {
                        model: AddressModel,
                        as: 'address',
                        required: true,
                        attributes: ["full_address"]
                    },
                    {
                        model: BirthDetailModel,
                        as: 'birth_detail',
                        required: true,
                        attributes: ["birth_place", "birth_date"],
                        include: [
                            {
                                model: PatientModel,
                                as: 'patient',
                                required: true,
                                attributes: ["uuid", "no_identity"],
                                include: [
                                    {
                                        model: LogPelayananModel,
                                        required: true,
                                        as: 'log_pelayanan',
                                        attributes: ["uuid", "jenis_kunjungan", "discharge_date"],
                                        // where: {
                                        //     discharge_date: {
                                        //         [Op.ne]: null
                                        //     }
                                        // }
                                    }
                                ]
                            }
                        ]
                    }
                ],
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
