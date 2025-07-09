import MonitoringRoomRepository from "../repositories/monitoring-room-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import ZodValidator from "../validations/zod-validator.js";
import MonitoringRoomValidation from "../validations/monitoring-room-validation.js";
import BadRequestException from "../exception/bad-request-exception.js";
import LokasiRepository from "../repositories/lokasi-repository.js";

export default class MonitoringRoomService {
  static async getAllRoom(args) {
    // const data = await MonitoringRoomRepository.getAllRoom(args);
    const data = await LokasiRepository.getAllRoom(args);
    // console.log("data = ", data);
    if (!data) throw new Error("Failed get all room");
    return data;
  }

  static async getDetail(uuid) {
    console.log("uuid = ", uuid);

    // const room = await LokasiRepository.getLokasiBy(uuid);
    const bedLocation = await LokasiRepository.getLokasiByPartOf(uuid);
    const uuids = bedLocation.map((loc) => loc.uuid);

    console.log("uuids = ", uuids);
    if (uuids.length === 0)
      throw new NotfoundException("Lokasi dengan tipe bed tidak ditemukan");

    const bedMonitoring = await MonitoringRoomRepository.getAllBed(uuids);
    const bedMonitoringPlain = bedMonitoring.map((item) => item.toJSON());

    // const data = await MonitoringRoomRepository.getDetail(uuid);
    if (bedMonitoring.length === 0)
      throw new NotfoundException("not found, bed belum ditambahkan");

    const combinedData = bedMonitoringPlain.map((bed) => {
      const location = bedLocation.find((loc) => loc.uuid === bed.lokasi_uuid);

      return {
        ...bed, // Mengambil semua properti dari bedMonitoring
        location_code: location?.code || null, // Hanya mengambil code dari bedLoc
        location_name: location?.name || null, // Hanya mengambil name dari bedLoc
      };
    });

    return combinedData;
  }

  static async updateBed(uuid, data) {
    const validData = ZodValidator.validate(
      MonitoringRoomValidation.UPDATE_ROOM,
      data
    );
    if (!validData) throw new BadRequestException("Bad Request");
    const result = await MonitoringRoomRepository.updateBed(uuid, data);
    if (!result) throw new Error("Failed update bed");
    return result;
  }
}
