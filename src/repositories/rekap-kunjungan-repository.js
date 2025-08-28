import { LogPelayananModel } from "@adameds/model-sdk/pelayanan";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Context } from "../middlewares/context.js";
import { Op } from "sequelize";
import { PegawaiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import { InsuranceAccountModel, PatientModel } from "@adameds/model-sdk/admisi";
import { buildRekap, generateDateRange } from "../helper/rekap-helper.js";

export default class RekapKunjunganRepository{
    static async getRekapJenisKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: true,
            tglRegistrasi: {
            [Op.between]: [args.start_date, args.end_date],
            },
        };

        if (args.jenis_kunjungan) {
            const jenisKunjunganArray = args.jenis_kunjungan.split(",").map((item) => item.trim());
            filter.jenisKunjungan = { [Op.in]: jenisKunjunganArray };
        }

        const kunjunganRows = await LogPelayananModel.findAll({
            where: {
            ...filter,
            },
            attributes: [
                "jenis_kunjungan",
                [sequelizeInstace.fn("TO_CHAR",sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")),"YYYY-MM-DD"), "tanggal"],
                [sequelizeInstace.fn("COUNT", sequelizeInstace.col("uuid")), "total_harian"],
            ],
            group: [
                "jenis_kunjungan",
                sequelizeInstace.fn("TO_CHAR",sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD"),
            ],
            order: [["jenis_kunjungan", "ASC"]],
            raw: true,
        });

        const allDates = generateDateRange(args.start_date, args.end_date);
        const { dataByGroup: kunjungan, totalHarian, totalPerGroup } = buildRekap(kunjunganRows, "jenis_kunjungan", allDates);

        //* Total keseluruhan Log
        const total_keseluruhan = await LogPelayananModel.count({ where: { ...filter } });

        return { kunjungan, total_harian: totalHarian, total_jenis_kunjungan: totalPerGroup, total_keseluruhan };
    }

    static async getRekapDokter(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: true,
                //* Filter Tanggal Registrasi
            tglRegistrasi: {
                [Op.between]: [args.start_date, args.end_date],
            },
        }

        // if (args.dokter) {
        //     const practitionerArray = args.dokter.split(",").map((item) => item.trim());
        //     filter.practitionerUuid = { [Op.in]: practitionerArray };
        // }

        if (args.dokter) {
            const dokterArray = args.dokter.split(",").map((item) => item.trim());
            filter[Op.and] = {
                [Op.or]: dokterArray.map((dokter) => sequelizeInstace.where(sequelizeInstace.col("practitioner.pegawai.name"), { [Op.iLike]: `%${dokter}%` })),
            };
        }

        const dokterRows = await LogPelayananModel.findAll({
            where: {
            ...filter,
            },
            include: {
                model: PractitionerModel,
                as: "practitioner",
                required: true,
                    where: {
                        is_doctor: { [Op.is]: true },
                        deletedAt: { [Op.is]: null }
                    },
                attributes: [],
                include: {
                    model: PegawaiModel,
                    as: "pegawai",
                    required: true,
                    attributes: []
                }
            },
            attributes: [
                [sequelizeInstace.col("practitioner.pegawai.name"), "nama_dokter"],
                [sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD"), "tanggal"],
                [sequelizeInstace.fn("COUNT", sequelizeInstace.col(`LogPelayananModel.uuid`)), "total_harian"],
            ],
            group: [
                sequelizeInstace.col("practitioner.uuid"),
                sequelizeInstace.col("practitioner.pegawai.uuid"),
                sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD")
            ],
            raw: true,
        });

        const allDates = generateDateRange(args.start_date, args.end_date);
        const { dataByGroup: dokter, totalHarian, totalPerGroup } = buildRekap(dokterRows, "nama_dokter", allDates);

        //* Total keseluruhan Dokter
        const total_keseluruhan = await LogPelayananModel.count({
            where: {
                ...filter,
            },
            include: {
                model: PractitionerModel,
                as: "practitioner",
                required: true,
                    where: {
                        is_doctor: { [Op.is]: true },
                        deletedAt: { [Op.is]: null }
                    },
                attributes: [],
                include: {
                    model: PegawaiModel,
                    as: "pegawai",
                    required: true,
                    attributes: []
                }
            },
        });

        return { dokter, total_harian: totalHarian, total_dokter: totalPerGroup, total_keseluruhan };
    }

    static async getRekapPenjamin(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: true,
                //* Filter Tanggal Registrasi
            tglRegistrasi: {
                [Op.between]: [args.start_date, args.end_date],
            },
        }

        if (args.penjamin) {
            const penjaminArray = args.penjamin.split(",").map((item) => item.trim());
            filter[Op.and] = {
                [Op.or]: penjaminArray.map((penjamin) => sequelizeInstace.where(sequelizeInstace.col("patient.insurance.name"), { [Op.iLike]: `%${penjamin}%` })),
            };
        }

        const penjaminRows = await LogPelayananModel.findAll({
            where: {
            ...filter,
            },
            include: {
                model: PatientModel,
                as: "patient",
                required: true,
                where: {
                    deletedAt: { [Op.is]: null }
                },
                attributes: [],
                include: {
                    model: InsuranceAccountModel,
                    as: "insurance",
                    required: true,
                    attributes: []
                }
            },
            attributes: [
                [sequelizeInstace.col("patient.insurance.name"), "nama_penjamin"],
                [sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD"), "tanggal"],
                [sequelizeInstace.fn("COUNT", sequelizeInstace.col(`LogPelayananModel.uuid`)), "total_harian"],
            ],
            group: [
                sequelizeInstace.col("patient.insurance.name"),
                sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD")
            ],
            raw: true,
        });

        const allDates = generateDateRange(args.start_date, args.end_date);
        const { dataByGroup: penjamin, totalHarian, totalPerGroup } = buildRekap(penjaminRows, "nama_penjamin", allDates);

        //* Total Keselurhan penjamin
        const total_keseluruhan = await LogPelayananModel.count({
            where: {
                ...filter,
                [Op.and]: [
                    sequelizeInstace.where(sequelizeInstace.col("patient.insurance.uuid"), { [Op.not]: null }),
                ]
            }, include: [
                {
                    model: PatientModel,
                    as: "patient",
                    required: true,
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    },
                    attributes: [],
                    include: {
                        model: InsuranceAccountModel,
                        as: "insurance",
                        required: true,
                        attributes: []
                    }
                }
            ]
        });

        return { penjamin, total_harian: totalHarian, total_penjamin: totalPerGroup, total_keseluruhan };
    }
}