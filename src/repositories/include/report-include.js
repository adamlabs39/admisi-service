import {Op} from "sequelize";
import { BirthDetailModel, PatientModel } from "@adameds/model-sdk/admisi";
import { PegawaiModel, PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { InsuranceAdmissionModel } from "@adameds/model-sdk/pelayanan";
import { AddressModel } from "@adameds/model-sdk/setting";
import { InsuranceAccountModel } from "@adameds/model-sdk/admisi";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

export const kunjunganReportInclude = (args) => [
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
                required: args.penjamin ? true : false,
                where: { deletedAt: { [Op.is]: null }, ...(args.penjamin && { name: { [Op.iLike]: `%${args.penjamin}%` } }) },
                attributes: ["name", "account_number"],
                include: [
                    {
                        model: InsuranceAdmissionModel,
                        as: "insurance_admissions",
                        required: false,
                        where: sequelizeInstance.where(
                            sequelizeInstance.col("patient.insurance.insurance_admissions.no_reg"),
                            { [Op.eq]: sequelizeInstance.col("noreg") }
                        ),
                        attributes: []
                    }
                ]
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
]