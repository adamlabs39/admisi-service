import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { Op, where } from "sequelize";
import Pagination from "../helper/pagination.js";
import { RuanganModel, KategoriRuanganModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { RoomMonitoringModel, PatientModel } from "@adameds/model-sdk/admisi";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import RuanganRepository from "./ruangan-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";
import DuplicateException from "../exception/duplicate-exception.js";
import moment from "moment";
import LokasiRepository from "./lokasi-repository.js";

export default class MonitoringRoomRepository {
  static async getAllRoom(args) {
    try {
      const user = Context.get(CTX_AUTHOR);
      const filter = {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${args.name || ""}%`,
            },
          },
        ],
        [Op.and]: [{ faskes_uuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
      };

      if (args.filter_kategori) {
        const kategoriArr = args.filter_kategori.split(",");
        filter.kategori_ruangan_uuid = {
          [Op.in]: kategoriArr,
        };
      }

      const option = {
        include: [
          {
            model: RoomMonitoringModel,
            required: false,
            as: "room_monitorings",
            where: {
              deletedAt: { [Op.is]: null },
            },
            attributes: ["uuid", "patient_uuid"],
          },
          {
            model: KategoriRuanganModel,
            required: false,
            as: "kategori_ruangan",
            attributes: ["uuid", "code", "name"],
          },
        ],
        attributes: ["uuid", "code", "name", "no_room", "kelas_ruangan", "status"],
      };

      const result = await Pagination.init(RuanganModel, args, filter, option);
      console.log(result.pagination);

      const plainData = result.data;

      const processedData = plainData.map((room) => {
        const total_bed = room.room_monitorings.length;
        const available = room.room_monitorings.filter((monitoring) => monitoring.patient_uuid === null).length;

        return {
          ...room,
          total_bed,
          available,
        };
      });

      return {
        data: processedData,
        pagination: result.pagination,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getAllBed(uuids) {
    const user = Context.get(CTX_AUTHOR);
    try {
      const data = await RoomMonitoringModel.findAll({
        where: {
          [Op.and]: [{ lokasi_uuid: uuids }, { faskes_uuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
        },
        include: [
          {
            model: PatientModel,
            required: false,
            as: "patient",
            attributes: ["no_rm", "name", "gender"],
          },
          {
            model: LokasiModel,
            required: false,
            as: "bed_lokasi",
            attributes: ["class_code", "class_name"],
          },
        ],
        order: [["no_bed", "ASC"]],
        attributes: ["uuid", "no_bed", "type", "status_operasional", "lokasi_uuid"],
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getDetail(uuid) {
    const user = Context.get(CTX_AUTHOR);
    try {
      const data = await RoomMonitoringModel.findAll({
        where: {
          [Op.and]: [{ room_uuid: uuid }, { faskesUuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
        },
        include: [
          {
            model: PatientModel,
            required: false,
            as: "patient",
            attributes: ["no_rm", "name", "gender"],
          },
        ],
        order: [["no_bed", "ASC"]],
        attributes: ["uuid", "patient_uuid", "room_category", "room_class", "room", "bed_name", "no_bed"],
      });

      return {
        total_bed: data.length,
        detail: data.map((item) => {
          return {
            ...item.toJSON(),
            is_available: item.patient === null,
          };
        }),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getDetailRoom(lokasi_uuid) {
    const user = Context.get(CTX_AUTHOR);
    try {
      const data = await RoomMonitoringModel.findAll({
        where: {
          [Op.and]: [{ faskesUuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
        },
        include: [
          {
            model: PatientModel,
            required: false,
            as: "patient",
            attributes: ["no_rm", "name", "gender"],
          },
          {
            model: LokasiModel,
            required: false,
            as: "lokasi",
            attributes: ["uuid", "code", "name", "location_type", "satu_sehat_id"],
          },
        ],
        attributes: ["uuid", "no_bed", "status_operasional", "type"],
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getDetailBed(uuid) {
    const user = Context.get(CTX_AUTHOR);
    try {
      const result = await RoomMonitoringModel.findOne({
        where: {
          [Op.and]: [{ uuid }, { faskesUuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
        },
      });
      if (!result) throw new NotfoundException("Bed tidak ditemukan");
      return result;
    } catch (error) {
      throw new NotfoundException("Bed tidak ditemukan");
    }
  }

  static async registPatientToBed(uuid, patientUuid, transaction = null) {
    const trx = transaction || (await sequelizeInstance.transaction());
    try {
      const user = Context.get(CTX_AUTHOR);
      const result = await RoomMonitoringModel.findOne({
        where: {
          [Op.and]: [{ uuid }, { faskesUuid: user.faskesUuid }, { deletedAt: { [Op.is]: null } }],
        },
        transaction: trx,
      });

      // if not found
      if (!result) throw new NotfoundException("Bed tidak ditemukan");

      if (result.patientUuid) throw new BadRequestException("Bed terpakai oleh pasien");

      // update bed
      await result.update(
        {
          patientUuid,
          status_operasional: "Penuh",
        },
        { transaction: trx, returning: true }
      );

      if (!transaction) await trx.commit();
      return result;
    } catch (error) {
      if (!transaction) await trx.rollback();
      throw error;
    }
  }

  static async updateBed(uuid, requestData) {
    try {
      const user = Context.get(CTX_AUTHOR);

      const data = Array.isArray(requestData) ? requestData : requestData.beds;

      if (!data || !Array.isArray(data)) {
        throw new BadRequestException("Data tidak ditemukan");
      }

      return await sequelizeInstance.transaction(async (t) => {
        // Get room data
        const dataRuangan = await LokasiRepository.getLokasiBy(uuid);
        if (!dataRuangan) throw new Error("Room tidak ditemukan");

        // Find existing beds
        const existingBeds = await RoomMonitoringModel.findAll({
          where: {
            room_uuid: uuid,
            faskesUuid: user.faskesUuid,
            deletedAt: { [Op.is]: null },
          },
          transaction: t,
        });

        // Collect UUIDs from incoming data
        const incomingUuids = data.map((bed) => bed.uuid).filter((uuid) => uuid !== null);

        // Delete beds that are not in the incoming data
        for (const bed of existingBeds) {
          if (!incomingUuids.includes(bed.uuid)) {
            if (bed.patientUuid) {
              // console.log(`Bed No: ${bed.noBed}, Monitoring Room:(${bed.uuid}), Bed Lokasi UUID:(${bed.lokasi_uuid}), bed type:(${bed.type}) is occupied by patient and cannot be deleted`);
              throw new BadRequestException(`Bed: ${bed.noBed} terpakai oleh pasien`);
            }
            await bed.update({ deletedAt: moment().unix() }, { transaction: t });
          }
        }

        // Update existing beds or create new ones
        for (const bedData of data) {
          if (bedData.lokasi_uuid) {
            const bedLocation = await LokasiRepository.getLokasiBy(bedData.lokasi_uuid);

            //* CHECK JIKA BED LOCATION ADA atau TIPE BED
            if (!bedLocation || bedLocation.location_type !== "Bed") {
              throw new BadRequestException(`Bed tidak tertemui atau bukan lokasi tipe Bed`);
            }
            //* CHECK JIKA BED MERUPAKAN BAGIAN DARI RUANGAN
            if (bedLocation.part_of_uuid !== uuid) {
              throw new BadRequestException(`Bed tidak termasuk dalam ruang ini`);
            }

            //* CHECK JIKA BED TERPAKAI
            for (const bedExist of existingBeds) {
              if (bedExist.lokasi_uuid === bedData.lokasi_uuid && bedExist.uuid !== bedData.uuid) {
                throw new BadRequestException(`Bed sedang digunakan`);
              }
            }

            //* CHECK JIKA NO BED 0
            if (bedData.no_bed === "0") {
              throw new BadRequestException(`No bed tidak boleh 0`);
            }
          }

          // check no bed is duplicated
          const checkDuplicateNoBed = data.filter((bed) => bed.no_bed === bedData.no_bed);
          if (checkDuplicateNoBed.length > 1) {
            throw new DuplicateException(`Terdapat duplikasi no bed: ${bedData.no_bed}`);
          }

          //* Check duplikasi Jenis bed
          const checkDuplicateBed = data.filter((bed) => bed.lokasi_uuid === bedData.lokasi_uuid);
          if (checkDuplicateBed.length > 1) {
            throw new DuplicateException(`Setiap lokasi bed hanya dapat digunakan satu kali dalam satu ruangan`);
          }

          if (bedData.uuid) {
            console.log("ada uuid", bedData.uuid);
            await RoomMonitoringModel.update(
              {
                lokasi_uuid: bedData.lokasi_uuid,
                noBed: bedData.no_bed,
                type: bedData.type,
              },
              {
                where: {
                  uuid: bedData.uuid,
                  faskesUuid: user.faskesUuid,
                  deletedAt: { [Op.is]: null },
                },
                transaction: t,
              }
            );
          } else {
            console.log("tidak ada uuid");
            await RoomMonitoringModel.create(
              {
                room_uuid: uuid,
                faskesUuid: user.faskesUuid,
                lokasi_uuid: bedData.lokasi_uuid,
                noBed: bedData.no_bed,
                type: bedData.type,
                status_operasional: "Tersedia",
              },
              { transaction: t }
            );
          }
        }

        const updatedBeds = await RoomMonitoringModel.findAll({
          where: {
            room_uuid: uuid,
            faskesUuid: user.faskesUuid,
            deletedAt: { [Op.is]: null },
          },
          transaction: t,
        });

        return {
          updatedBeds,
          room: dataRuangan,
        };
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
