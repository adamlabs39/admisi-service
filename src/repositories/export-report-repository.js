import { BirthDetailModel, NewBornModel, PatientModel, RoomMonitoringModel } from "@adameds/model-sdk/admisi";
import { PegawaiModel, PractitionerModel, LokasiModel, KategoriRuanganModel } from "@adameds/model-sdk/datamaster";
import { InsuranceAdmissionModel, LogPelayananModel, RawatInapModel } from "@adameds/model-sdk/pelayanan";
import { AddressModel } from "@adameds/model-sdk/setting";
import { InsuranceAccountModel } from "@adameds/model-sdk/admisi";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Op } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import { cancelReportFilter, keperawatanInapFilter, kunjunganReportFilter, newBornFilter, statusKamarFilter } from "./filters/report-filter.js";
import { cancelReportInclude, keperawatanInapInclude, kunjunganReportInclude, newBornInclude, statusKamarInclude } from "./include/report-include.js";

// RoomMonitoringModel.hasOne(RawatInapModel, {
//     foreignKey: "monitoring_room_uuid",
//     as: "rawat_inap",
// });

InsuranceAccountModel.hasMany(InsuranceAdmissionModel, {
    foreignKey: 'insurance_account_uuid',
    as: 'insurance_admissions',
});

export default class ExportReportRepository {

    static async getExportKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = kunjunganReportFilter({ faskesUuid, args, options: {} });

        return await LogPelayananModel.findAll({
            where: {
                ...filter,
            },
            include: kunjunganReportInclude(args),
            attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "discharge_date"]
        });
    }

    static async getExportBatalKunjungan(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = cancelReportFilter({ faskesUuid, args, options: {} });

        return await LogPelayananModel.findAll({
            where: {
                ...filter,
            },
            include: cancelReportInclude,
            attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "cancel_reason", "cancel_date", "cancel_by"],
        });
    }

    static async getExportStatusKamar(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = statusKamarFilter({ faskesUuid, args, options: {} });

        return await RoomMonitoringModel.findAll({
            where: { 
                ...filter 
            },
            include: statusKamarInclude,
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

        const filter = keperawatanInapFilter({ faskesUuid, args, options: {} });

        return await RawatInapModel.findAll({
            where: {
                ...filter,
                dischargeDate: {
                    [Op.not]: null
                }
            },
            include: keperawatanInapInclude,
            attributes: ["no_rm", "tanggal_daftar", "tanggal_dirawat", "discharge_date"],
        })
    }

    static async getExportNewBorn(args) {
        const { faskesUuid } = Context.get(CTX_AUTHOR);

        const filter = newBornFilter({ faskesUuid, args, options: {} });

        return await NewBornModel.findAll({
            where: {
                ...filter
            },
            include: newBornInclude,
            attributes: [
                "uuid", "identifier_mom", "name_mom", "name_baby", "no_rm_baby", "birth_time_baby", "gender_baby", "multiple_birth", "tanggal_daftar"
            ],
        });
    }
}