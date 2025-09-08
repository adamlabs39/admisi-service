import {Op} from "sequelize";
import { LokasiModel, PegawaiModel, PractitionerModel, KategoriRuanganModel } from "@adameds/model-sdk/datamaster";
import { BirthDetailModel, PatientModel, RoomMonitoringModel,  } from "@adameds/model-sdk/admisi";
import { AddressModel } from "@adameds/model-sdk/setting";

export const rawatInapInclude = [
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
        ],
        attributes: ["uuid", "title", "name", "identity", "no_identity", "phone", "gender", "is_new_born"],
    },
    {
        model: BirthDetailModel,
        as: "birth_detail",
        required: true,
        where: { deletedAt: { [Op.is]: null } },
        attributes: ["age_year", "age_month", "age_day"],
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
            include: [
                {
                    model: KategoriRuanganModel,
                    as: "kategori_ruangan",
                    required: true,
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: ["uuid", "code", "name"],
                },
            ],
        },
        ],
    },
]