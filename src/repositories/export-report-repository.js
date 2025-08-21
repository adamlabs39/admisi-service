import { BirthDetailModel, NewBornModel, PatientModel, RoomMonitoringModel } from "@adameds/model-sdk/admisi";
import { PegawaiModel, PractitionerModel, LokasiModel, KategoriRuanganModel } from "@adameds/model-sdk/datamaster";
import { LogPelayananModel, RawatInapModel } from "@adameds/model-sdk/pelayanan";
import { AddressModel } from "@adameds/model-sdk/setting";
import { InsuranceAccountModel } from "@adameds/model-sdk/admisi";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Op } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";

// RoomMonitoringModel.hasOne(RawatInapModel, {
//     foreignKey: "monitoring_room_uuid",
//     as: "rawat_inap",
// });

export default class ExportReportRepository {
    static async getExportKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: true,
            [Op.or]: [
                //* Filter No Rm Layanan
            { noreg: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
                //* Filter Tanggal Registrasi
            tglRegistrasi: {
                [Op.between]: [args.start_date, args.end_date],
            },
        }

            //* Filter Jenis Kunjungan
        if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

            //* Filter Dokter
        if (args.practitioner_uuid) filter.practitionerUuid = args.practitioner_uuid;

            //* Filter Penjamin
        if (args.penjamin) filter.penjamin = sequelizeInstance.where(sequelizeInstance.col("patient.insurance.name"), { [Op.iLike]: `%${args.penjamin}%` });

        return await LogPelayananModel.findAll({
            where: {
                ...filter
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
            attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "discharge_date"]
        });
    }

    static async getExportBatalKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: false,
            deletedAt: { [Op.is]: null },
            [Op.or]: [
                //* Filter No Rm Layanan
            { noreg: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
                //* Filter Tanggal Registrasi
            tglRegistrasi: {
                [Op.between]: [args.start_date, args.end_date],
            },
        }

            //* Filter Jenis Kunjungan
        if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

            //* Filter Penjamin
        if (args.penjamin) filter.penjamin = sequelizeInstance.where(sequelizeInstance.col("patient.insurance.name"), { [Op.iLike]: `%${args.penjamin}%` });

        return await LogPelayananModel.findAll({
            where: {
                ...filter
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
            attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "cancel_reason", "cancel_date", "cancel_by"],
        });
    }

    static async getExportStatusKamar(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            deletedAt: { [Op.is]: null },
            [Op.or]: [
                //* Filter Tanggal Daftar
            sequelizeInstance.where(sequelizeInstance.col("rawat_inap.tanggal_daftar"), {
                [Op.between]: [args.start_date, args.end_date],
            }),
            ]
        };

            //* Filter Jenis Kunjungan
        if (args.room) filter.room_uuid = args.room;

        return await RoomMonitoringModel.findAll({
            where: { 
                ...filter 
            },
            include: [
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
                    where: { deletedAt: { [Op.is]: null } },
                    attributes: [],
                },
            ],
            attributes: [
                "room_uuid",
                [sequelizeInstance.fn("COUNT", sequelizeInstance.col("RoomMonitoring.patient_uuid")), "jumlahPasien"]
            ],
            group: [
                "room_uuid",
                "room.kategori_ruangan.uuid",
                "room.kategori_ruangan.name",
                "room.uuid",
                "room.name",
                "room.class_name"
            ],
        });
    }

    static async getExportKeperawatanInap(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            // dischargeDate: { [Op.ne]: null },
            [Op.or]: [
                   //* Filter No Rm Layanan
            { no_rm: { [Op.iLike]: `%${args.q || ""}%` } },
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
            status_ri: { [Op.not]: 0 },
            tanggalDaftar: {
                [Op.between]: [args.start_date, args.end_date]
            }
        };

        if (args.room) filter.room = sequelizeInstance.where(sequelizeInstance.col("monitoring_room.room.uuid"), { [Op.iLike]: `${args.room}` });

        return await RawatInapModel.findAll({
            where: {
                ...filter
            },
            include: [
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
                        attributes: [],
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
            ],
            attributes: ["no_rm", "tanggal_daftar", "tanggal_dirawat", "discharge_date"],
        })
    }

    static async getExportNewBorn(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            deletedAt: null,
            [Op.or]: [
                { noRmBaby: { [Op.iLike]: `%${args.q}%` } },
                { nameBaby: { [Op.iLike]: `%${args.q}%` } },
                sequelizeInstance.where(
                    sequelizeInstance.col("address.full_address"),
                    { [Op.iLike]: `%${args.q || ""}%` }
                )
            ],
            tglDaftar: {
                [Op.between]: [args.start_date, args.end_date],
            },
        };

        if (args.jenis_kunjungan) filter.jenis_kunjungan = sequelizeInstance.where(
            sequelizeInstance.col('birth_detail.patient.log_pelayanan.jenis_kunjungan'),
            { [Op.eq]: `${args.jenis_kunjungan}` }
        );

        return await NewBornModel.findAll({
            where: {
                ...filter
            },
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
                                    //     discharge_date: { [Op.ne]: null }
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
        });
    }
}