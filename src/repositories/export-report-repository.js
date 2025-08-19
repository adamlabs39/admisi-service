import { BirthDetailModel, PatientModel } from "@adameds/model-sdk/admisi";
import { PegawaiModel, PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { LogPelayananModel } from "@adameds/model-sdk/pelayanan";
import { AddressModel } from "@adameds/model-sdk/setting";
import { InsuranceAccountModel } from "@adameds/model-sdk/admisi";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Op } from "sequelize";

export default class ExportReportRepository {
    static async getExportKunjungan() {
        const { faskesUuid } = Context.get(CTX_AUTHOR);
        return await LogPelayananModel.findAll({
            where: {
                faskesUuid,
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: PatientModel,
                    as: "patient",
                    required: true,
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    },
                    include: [
                        {
                            model: AddressModel,
                            as: "address",
                            required: true,
                            where: {
                                deletedAt: {
                                    [Op.is]: null
                                }
                            },
                            attributes: ["prov", "city", "district", "rt", "rw", "full_address", "country", "village"],
                        },
                        {
                            model: BirthDetailModel,
                            as: "birth_detail",
                            required: true,
                            where: {
                                deletedAt: {
                                    [Op.is]: null
                                }
                            },
                            attributes: ["age_year", "age_month", "age_day", "birth_date"],
                        },
                        {
                            model: InsuranceAccountModel,
                            as: "insurance",
                            required: false,
                            where: { deletedAt: { [Op.is]: null } },
                            attributes: ["name", "account_number"],
                        },
                    ],
                    attributes: ["uuid", "title", "name", "identity", "no_identity", "phone", "gender", "no_rm"],
                },
                {
                    model: PractitionerModel,
                    as: "practitioner",
                    required: true,
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    },
                    attributes: ["uuid"],
                    include: [
                        {
                            model: PegawaiModel,
                            as: "pegawai",
                            required: true,
                            where: {
                                deletedAt: {
                                    [Op.is]: null
                                }
                            },
                            attributes: ["first_title", "last_title", ["name", "nama"], "gender"]
                        }
                    ],
                },
                {
                    model: LokasiModel,
                    as: "lokasi",
                    required: false,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["name"], 
                },
            ],
            attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid"]
        });
    }

}