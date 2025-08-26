import { LogPelayananModel } from "@adameds/model-sdk/pelayanan";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Context } from "../middlewares/context.js";
import { Op } from "sequelize";
import { PegawaiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import { InsuranceAccountModel, PatientModel } from "@adameds/model-sdk/admisi";

export default class RekapKunjunganRepository{
    static async getRekapJenisKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = {
            faskesUuid,
            status: true,
                //* Filter Tanggal Registrasi
            tglRegistrasi: {
                [Op.between]: [args.start_date, args.end_date],
            },
        }

        if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

        const kunjungan = await LogPelayananModel.findAll({
            where: {
            ...filter,
            },
            attributes: [
            "jenis_kunjungan",
            [sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD"), "tanggal"],
            [sequelizeInstace.fn("COUNT", sequelizeInstace.col("uuid")), "total_harian"],
            ],
            group: ["jenis_kunjungan", 
                sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD")],
            order: [["jenis_kunjungan", "ASC"]],
            raw: true,
        });

        //* Total Harian kunjungan berdasarkan tanggal
        const totalHarian = kunjungan.reduce((total_harian, row) => {
            const tgl = row.tanggal;
            if (!total_harian[tgl]) total_harian[tgl] = 0;
            total_harian[tgl] += parseInt(row.total_harian);
            return total_harian;
        }, {});

        const total_harian = Object.entries(totalHarian).map(([tgl, total]) => ({
            tanggal: tgl,
            total: total
        }));

        //* Total Kunjungan berdasarkan jenis layanan
        const totalJenisKunjungan = kunjungan.reduce((jenis_kunjungan, row) => {
            const kunjungan = row.jenis_kunjungan;
            if (!jenis_kunjungan[kunjungan]) jenis_kunjungan[kunjungan] = 0;
            jenis_kunjungan[kunjungan] += parseInt(row.total_harian);
            return jenis_kunjungan;
        }, {});

        const total_jenis_kunjungan = Object.entries(totalJenisKunjungan).map(([jenis_kunjungan, total]) => ({
            jenis_kunjungan: jenis_kunjungan,
            total: total
        }));

        //* Total Kunjungan
        const total_kunjungan = await LogPelayananModel.count({
            where: {
                ...filter,
            }
        });

        return { kunjungan, total_harian, total_jenis_kunjungan, total_kunjungan };
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

        if (args.dokter) filter.practitionerUuid = args.dokter

        const dokter = await LogPelayananModel.findAll({
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
            // order: [[PractitionerModel, PegawaiModel, "name", "ASC"]],
            raw: true,
        });

        //* Total Harian dokter berdasarkan tanggal
        const totalHarian = dokter.reduce((total_harian, row) => {
            const tgl = row.tanggal;
            if (!total_harian[tgl]) total_harian[tgl] = 0;
            total_harian[tgl] += parseInt(row.total_harian);
            return total_harian;
        }, {});

        const total_harian = Object.entries(totalHarian).map(([tgl, total]) => ({
            tanggal: tgl,
            total: total
        }));

        //* Total Kunjungan berdasarkan Nama Dokter
        const totalDokter = dokter.reduce((dokter, row) => {
            const nama_dokter = row.nama_dokter;
            if (!dokter[nama_dokter]) dokter[nama_dokter] = 0;
            dokter[nama_dokter] += parseInt(row.total_harian);
            return dokter;
        }, {});

        const total_dokter = Object.entries(totalDokter).map(([nama_dokter, total]) => ({
            nama_dokter: nama_dokter,
            total: total
        }));
        
        //* Total Kunjungan
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

        return { dokter, total_harian, total_dokter, total_keseluruhan };
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

        if (args.penjamin) filter.penjaminUuid = sequelizeInstace.where(sequelizeInstace.col("patient.insurance.uuid"), { [Op.eq]: `${args.penjamin}` });

        const penjamin = await LogPelayananModel.findAll({
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

         //* Total Harian dokter berdasarkan tanggal
        const totalHarian = penjamin.reduce((total_harian, row) => {
            const tgl = row.tanggal;
            if (!total_harian[tgl]) total_harian[tgl] = 0;
            total_harian[tgl] += parseInt(row.total_harian);
            return total_harian;
        }, {});

        const total_harian = Object.entries(totalHarian).map(([tgl, total]) => ({
            tanggal: tgl,
            total: total
        }));

        //* Total Kunjungan berdasarkan Nama Penjamin
        const totalPenjamin = penjamin.reduce((penjamin, row) => {
            const nama_penjamin = row.nama_penjamin;
            if (!penjamin[nama_penjamin]) penjamin[nama_penjamin] = 0;
            penjamin[nama_penjamin] += parseInt(row.total_harian);
            return penjamin;
        }, {});

        const total_penjamin = Object.entries(totalPenjamin).map(([nama_penjamin, total]) => ({
            nama_penjamin: nama_penjamin,
            total: total
        }));

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

        return { penjamin, total_harian, total_penjamin, total_keseluruhan };
    }
}