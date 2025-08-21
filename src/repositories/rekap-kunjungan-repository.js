import { LogPelayananModel } from "@adameds/model-sdk/pelayanan";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Context } from "../middlewares/context.js";
import { Op } from "sequelize";
import { PegawaiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import sequelizeInstace from "../configurations/sequelize-instance.js";

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

        // if (args.jenis_kunjungan) filter.jenisKunjungan = args.jenis_kunjungan;

        const dokter = await LogPelayananModel.findAll({
            where: {
            ...filter,
            },
            include: {
                model: PractitionerModel,
                as: "practitioner",
                required: true,
                    where: {
                        is_doctor: { [Op.is]: true }
                    },
                attributes: ["uuid"],
                include: {
                    model: PegawaiModel,
                    as: "pegawai",
                    required: true,
                    attributes: ["name"]
                }
            },
            attributes: [
                [sequelizeInstace.col("practitioner.uuid"), "practitioner_uuid"],
                [sequelizeInstace.col("practitioner.pegawai.name"), "pegawai_name"],
                // [sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD"), "tanggal"],
                // [sequelizeInstace.fn("COUNT", sequelizeInstace.col(`log_pelayanans.uuid`)), "total_harian"],
            ],
            group: [
                sequelizeInstace.col("practitioner.uuid"),
                sequelizeInstace.col("practitioner.pegawai.uuid"),
                // sequelizeInstace.fn("TO_CHAR", sequelizeInstace.fn("TO_TIMESTAMP", sequelizeInstace.col("tgl_registrasi")), "YYYY-MM-DD")
            ],
            raw: true,
        });

        return dokter;
    }
}