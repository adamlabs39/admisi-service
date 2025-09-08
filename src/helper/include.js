import {Op} from "sequelize";
import { LokasiModel, PegawaiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import { BirthDetailModel, InsuranceAccountModel, PatientModel } from "@adameds/model-sdk/admisi";
import { AddressModel } from "@adameds/model-sdk/setting";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";

export const rawatJalanInclude = [
    {
        model: PatientModel,
        as: "patient",
        required: false,
        where: {
            deletedAt: {[Op.is]: null}
        },
        include: [
            {
                model: AddressModel,
                as: "address",
                required: false,
                where: {
                    deletedAt: {[Op.is]: null}
                },
                attributes: [
                    "uuid", "full_address", "prov", "city", "district", "rt", "rw", "village", "country", "postal_code"
                ],
            },
        ],
        attributes: [
            "uuid", "no_rm", "title", "name", "identity", "no_identity", "gender", "phone", "religion", "language", "mother_name", "maritial_status", "status",
        ]
    },
    {
        model: BirthDetailModel,
        as: "birth_detail",
        required: true,
        where: {deletedAt: {[Op.is]: null}},
        attributes: [
            "birth_place", "birth_date", "age_year", "age_day", "age_month"
        ]
    },
    {
        model: PractitionerModel,
        as: "practitioner",
        required: true,
        where: {deletedAt: {[Op.is]: null}},
        attributes: ["uuid"],
        include: [
            {
                model: PegawaiModel,
                as: "pegawai",
                required: true,
                where: {deletedAt: {[Op.is]: null}},
                attributes: ["first_title", "last_title", ["name", "nama"], "nik"]
            }
        ]
    },
    {
        model: LokasiModel,
        as: "lokasi",
        required: true,
        where: {deletedAt: {[Op.is]: null}},
        attributes: [
            "uuid", "name", "code"
        ]
    },
    {
        model: JadwalDokterModel,
        as: "jadwal_dokter",
        required: true,
        where: {deletedAt: {[Op.is]: null}},
        attributes: ["uuid", "start_time", "end_time", "kuota"],
    }
]