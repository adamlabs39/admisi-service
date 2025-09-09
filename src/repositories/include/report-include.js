import {Op} from "sequelize";
import { BirthDetailModel, PatientModel, RoomMonitoringModel } from "@adameds/model-sdk/admisi";
import { PegawaiModel, PractitionerModel, LokasiModel, KategoriRuanganModel } from "@adameds/model-sdk/datamaster";
import { InsuranceAdmissionModel, LogPelayananModel, RawatInapModel } from "@adameds/model-sdk/pelayanan";
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

export const cancelReportInclude = [
    {
        model: PatientModel,
        as: "patient",
        required: true,
        where: {
            deletedAt: { [Op.is]: null },
        },
        include: [
            {
                model: AddressModel,
                as: "address",
                required: true,
                where: {
                    deletedAt: { [Op.is]: null },
                },
                attributes: ["prov", "city", "district", "rt", "rw", "full_address", "country", "village"],
            },
            {
                model: BirthDetailModel,
                as: "birth_detail",
                required: true,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["age_year", "age_month", "age_day"],
            },
        ],
        attributes: ["uuid", "title", "name", "identity", "no_identity", "phone", "no_rm"],
        },
        {
            model: PractitionerModel,
            as: "practitioner",
            required: true,
            where: { deletedAt: { [Op.is]: null } },
            attributes: ["uuid"],
            include: [
                {
                    model: PegawaiModel,
                    as: "pegawai",
                    required: true,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["first_title", "last_title", ["name", "nama"], "gender"],
                },
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

export const statusKamarInclude = [
    {
        model: LokasiModel,
        as: "room",
        required: true,
        where: { deletedAt: { [Op.is]: null } },
        attributes: ["uuid", "name", "class_name"],
        include: [
            {
                model: KategoriRuanganModel,
                as: "kategori_ruangan",
                required: false,
                attributes: ["uuid", "name"],
            },
        ],
    },
    {
        model: RawatInapModel,
        as: "rawat_inap",
        required: false,
        where: {
        deletedAt: { [Op.is]: null },
        },
        attributes: [],
    },
]

export const keperawatanInapInclude = [
    {
        model: PatientModel,
        as: "patient",
        required: true,
        where: { deletedAt: { [Op.is]: null } },
        include: [
            {
                model: AddressModel,
                as: "address",
                required: true,
                where: {
                deletedAt: { [Op.is]: null },
                },
                attributes: ["full_address"],
            },
        ],
        attributes: ["name"],
    },
    {
        model: RoomMonitoringModel,
        as: "monitoring_room",
        required: true,
        where: { deletedAt: { [Op.is]: null } },
        attributes: ["uuid", "room_uuid", "no_bed"],
        include: [
            {
                model: LokasiModel,
                as: "bed_lokasi",
                required: true,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["uuid", "code", "name", "class_code", "class_name"],
            },
            {
                model: LokasiModel,
                as: "room",
                required: true,
                where: { deletedAt: { [Op.is]: null } },
                attributes: ["uuid", "code", "name", "class_code", "class_name"],
            }
        ],
    },
]

export const newBornInclude = [
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
                    }
                ]
            }
        ]
    }
]