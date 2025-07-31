import {
  KategoriRuanganModel,
  LokasiModel,
} from "@adameds/model-sdk/datamaster";
import { Op, where } from "sequelize";
import NotfoundException from "../exception/notfound-exception.js";
import { Context } from "../middlewares/context.js";
import { CTX_AUTHOR } from "../constant/context-constant.js";
import { RoomMonitoringModel } from "@adameds/model-sdk/admisi";

LokasiModel.belongsTo(KategoriRuanganModel, {
  as: "kategori_ruangan",
  foreignKey: "kategori_ruangan_uuid",
});

const pelayanan = ["RJ", "RI", "IGD"];
const type = ["Bed", "Room"];

export default class LokasiRepository {
  static async getLokasiBy(value) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);

    const options = {
      where: {
        uuid: value, // Pastikan value tidak undefined
        faskes_uuid: faskesUuid, // Pastikan properti dan nilai jelas
      },
      include: [
        {
          model: KategoriRuanganModel,
          as: "kategori_ruangan",
          required: false,
          attributes: ["code", "name"],
        },
      ],
    };

    const data = await LokasiModel.findOne(options);

    return data;
  }

  static async getLokasiByPartOf(value) {
    const { faskesUuid } = Context.get(CTX_AUTHOR);

    const options = {
      where: {
        part_of_uuid: value, // Pastikan value tidak undefined
        location_type: type[0],
        faskes_uuid: faskesUuid, // Pastikan properti dan nilai jelas
      },
      attributes: ["uuid", "code", "name", "class_code", "class_name"],
    };

    const data = await LokasiModel.findAll(options);

    return data;
  }

  static async getAllRoom(args) {
    try {
      const user = Context.get(CTX_AUTHOR);
      const options = {
        where: {
          [Op.and]: [
            { location_type: type[1] },
            { pelayanan: pelayanan[1] },
            { faskes_uuid: user.faskesUuid },
            { deleted_at: { [Op.is]: null } },
          ],
        },
        include: [
          {
            model: KategoriRuanganModel,
            as: "kategori_ruangan",
            required: true,
            attributes: ["uuid","code", "name"],
          },
        ],
        order: [["created_at", "DESC"]],
        attributes: ["uuid", "code", "name", "class_code", "class_name"],
      };

      // Tambahkan filter name hanya jika ada nilai yang valid
      if (args.name && args.name.trim() !== "") {
        options.where[Op.and].push({
          name: {
            [Op.like]: `%${args.name.trim()}%`,
          },
        });
      }

      //* FILTER BERDASARKAN KATEGORI RUANGAN
      if (args.filter_kategori && args.filter_kategori.trim() !== "") {
        const kategoriRuangan = options.include.find((tabelKr) => tabelKr.as === "kategori_ruangan");
        if (kategoriRuangan) {
          const kategoriUuids = args.filter_kategori
            .split(",")
            .map((uuid) => uuid.trim())
            .filter((uuid) => uuid !== "");
          kategoriRuangan.where = {
            uuid: {
              [Op.in]: kategoriUuids,
            },
          };
        }
      }

      const data = await LokasiModel.findAll(options);

      //*STATUS OPERASIONAL RUANGAN
      const roomData = await Promise.all(
        data.map(async (room) => {
          const rooms = room.get({ plain: true });

          const totalBed = await RoomMonitoringModel.count({
            where: {
              room_uuid: rooms.uuid,
              faskes_uuid: user.faskesUuid,
              deleted_at: { [Op.is]: null },
            },
          });

          const usedBed = await RoomMonitoringModel.count({
            where: {
              room_uuid: rooms.uuid,
              faskes_uuid: user.faskesUuid,
              status_operasional: "Penuh",
              deleted_at: { [Op.is]: null },
            },
          });

          let statusOperasional = "Tersedia";

          if (totalBed > 0 && usedBed === totalBed) {
            statusOperasional = "Penuh";
          }
          
          return {
            ...rooms,
            status_operasional_ruangan: statusOperasional,
          };
        })
      );

      // Konversi ke plain object
      return roomData
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
