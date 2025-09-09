import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { convertSnakeToCamel, getInfoInsurance } from "../helper/utility.js";
import { Op } from "sequelize";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import { InsuranceAdmissionModel, LogPelayananModel, RawatInapModel } from "@adameds/model-sdk/pelayanan";
import { PatientModel, BirthDetailModel, InsuranceAccountModel, RoomMonitoringModel } from "@adameds/model-sdk/admisi";
import { AddressModel } from "@adameds/model-sdk/setting";
import { PractitionerModel, PegawaiModel, LokasiModel, KategoriRuanganModel } from "@adameds/model-sdk/datamaster";

import Pagination from "../helper/pagination.js";
import moment from "moment";
import { cancelReportFilter, kunjunganReportFilter, statusKamarFilter } from "./filters/report-filter.js";
import { cancelReportInclude, kunjunganReportInclude, statusKamarInclude } from "./include/report-include.js";

RoomMonitoringModel.hasOne(RawatInapModel, {
  foreignKey: "monitoring_room_uuid",
  as: "rawat_inap",
});


export default class LogPelayananRepository {
  /**
   * Function to create or update Log Pelay
   * @param data
   * @returns {Promise<LogPelayananModel>}
   * @constructor
   */
  static async LogPelayanan(data) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    data = convertSnakeToCamel(data);
    try {
      const logPelayanan = await LogPelayananModel.findOne({
        where: {
          faskesUuid,
          noreg: data.noreg,
          noPelayanan: data.noPelayanan,
          deletedAt: null,
        },
      });
      if (logPelayanan) {
        return await logPelayanan.update({
          patientUuid: data.patientUuid,
          jenisKunjungan: data.jenisKunjungan,
          lokasiUuid: data.lokasiUuid,
          practitionerUuid: data.practitionerUuid,
        });
      }
      return await LogPelayananModel.create({ faskesUuid, ...data });
    } catch (error) {
      throw error;
    }
  }

  static async cancelVisitLogPelayanan(data) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    data = convertSnakeToCamel(data);
    console.log("Cancel datas:", data);
    try {
      const update = await LogPelayananModel.update(
        {
          status: false,
          cancelReason: data.cancelReason,
          cancelDate: moment().unix(),
          cancelBy: data.cancelBy,
        },
        {
          where: {
            faskesUuid,
            noPelayanan: {
              [Op.in]: data.listNoPelayanan,
            },
          },
        }
      );

      console.log("Hasil update: ", update);
      return update;
    } catch (error) {
      throw error;
    }
  }

  static async GetHistoryPemeriksaan(patient_uuid, args) {
    try {
      const { faskesUuid } = Context.get(CTX_AUTHOR);
      const filter = {
        patientUuid: patient_uuid,
        status: true,
        faskesUuid,
      };

      const options = {
        include: [
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
                attributes: ["first_title", "last_title", ["name", "nama"]],
              },
            ],
          },
        ],
        order: [["tgl_registrasi", "DESC"]],
        attributes: ["tgl_registrasi", "jenis_kunjungan", "no_pelayanan", "payment_method"],
      };

      const transform = {
        practitioner: (row) => ({
          uuid: undefined,
          ...row.practitioner.pegawai.get(),
        }),
      };

      return await Pagination.init(LogPelayananModel, args, filter, options, transform);
    } catch (error) {
      console.log("Error on LogPelayananRepository");
      throw error;
    }
  }

  static async getAllLogPelayanan(args) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    try {
      
      const filter = kunjunganReportFilter({ faskesUuid, args, options: {} });

      const options = {
        include: kunjunganReportInclude(args),
        attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "discharge_date"],
      };

      const transform = {
        practitioner: (row) => ({
          uuid: undefined, // delete practitioner uuid
          ...row.practitioner.pegawai.get(),
        }),
        polyclinic: (row) => (row.lokasi ? row.lokasi.get().name : "-"),
        lokasi: (row) => undefined,
      };

      return await Pagination.init(LogPelayananModel, args, filter, options, transform);
    } catch (error) {
      console.log("Error on LogPelayananRepository");
      throw error;
    }
  }

  static async getAllCancelVisitLogPelayanan(args) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);
    try {

      const filter = cancelReportFilter({ faskesUuid, args, options: {} });
      
      const options = {
        include: cancelReportInclude,
        attributes: ["tgl_registrasi", "noreg", "no_pelayanan", "jenis_kunjungan", "patient_uuid", "lokasi_uuid", "cancel_reason", "cancel_date", "cancel_by"],
      };

      const transform = {
        practitioner: (row) => ({
          uuid: undefined, // delete practitioner uuid
          ...row.practitioner.pegawai.get(),
        }),
        polyclinic: (row) => (row.lokasi ? row.lokasi.get().name : "-"),
        lokasi: (row) => undefined,
      };
      return await Pagination.init(LogPelayananModel, args, filter, options, transform);
    } catch (error) {
      console.log("Error on LogPelayananRepository");
      throw error;
    }
  }

  static async getReportStatusKamar(args) {
      const { faskesUuid } = Context.get(CTX_AUTHOR);
      try {

        const filter = statusKamarFilter({ faskesUuid, args, options: {} });
        
        const options = {
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
            "room.class_name",
        ],
        };

      return await Pagination.initWithGroup(RoomMonitoringModel, args, filter, options);
      } catch (error) {
      throw error;
      }
  }
}
