import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {Op} from "sequelize";
import Pagination from "../helper/pagination.js";
import RuanganModel from "../models/ruangan-model.js";
import RoomMonitoringModel from "../models/room-monitoring-model.js";
import KategoriRuanganModel from "../models/kategori-ruangan-model.js";
import sequelizeInstance from "../configurations/sequelize-instance.js";
import PatientModel from "../models/patient-model.js";
import RuanganRepository from "./ruangan-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";

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
                    }
                ],
                [Op.and]: [
                    {faskesUuid: user.faskesUuid},
                    {deletedAt: {[Op.is]: null}},
                    {kelasRuangan: args.filter_kelas || {[Op.ne]: null}},
                    {kategoriRuanganUuid: args.filter_kategori || {[Op.ne]: null}},
                ]
            };

            const option = {
                include: [
                    {
                        model: RoomMonitoringModel,
                        required: true,
                        as: "room_monitorings",
                        attributes: [
                            "uuid",
                            "patient_uuid",
                        ]
                    },
                    {
                        model: KategoriRuanganModel,
                        required: true,
                        as: "kategori_ruangan",
                        attributes: [
                            "uuid",
                            "code",
                            "name",
                        ]
                    }
                ],
                attributes: [
                    "uuid",
                    "code",
                    "name",
                    "no_room",
                    "kelas_ruangan",
                    "status"
                ]
            };

            const result = await Pagination.init(
                RuanganModel,
                args,
                filter,
                option,
            );
            console.log(result.pagination);

            const plainData = result.data.map(room => room.toJSON());

            const processedData = plainData.map(room => {
                const total_bed = room.room_monitorings.length;
                const available = room.room_monitorings.filter(monitoring => monitoring.patient_uuid === null).length;

                return {
                    ...room,
                    total_bed,
                    available
                };
            });

            return {
                data: processedData,
                pagination: result.pagination
            };
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
                    [Op.and]: [
                        {room_uuid: uuid},
                        {faskesUuid: user.faskesUuid},
                        {deletedAt: {[Op.is]: null}}
                    ]
                },
                include: [
                    {
                        model: PatientModel,
                        required: false,
                        as: "patient",
                    }
                ],
                attributes: ["uuid", "patient_uuid", "room_category", "room_class", "room", "bed_name", "no_bed"]
            });
            return data.map(item => {
                return {
                    ...item.toJSON(),
                    is_available: item.patient === null
                };
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


    static async getDetailBed(uuid) {
        const user = Context.get(CTX_AUTHOR);
        try{
            return await RoomMonitoringModel.findOne({
                where: {
                    [Op.and]: [
                        {uuid},
                        {faskesUuid: user.faskesUuid},
                        {deletedAt: {[Op.is]: null}}
                    ]
                },
            });
        }catch (error){
            throw new NotfoundException("Bed not found");
        }
    }


    static async registPatientToBed(uuid, patientUuid, transaction = null) {
        const trx = transaction || await sequelizeInstance.transaction();
        try {
            const user = Context.get(CTX_AUTHOR);
            const result = await RoomMonitoringModel.findOne({
                where: {
                    [Op.and]: [
                        {uuid},
                        {faskesUuid: user.faskesUuid},
                        {deletedAt: {[Op.is]: null}}
                    ]
                },
                transaction: trx
            });

            // if not found
            if (!result) throw new NotfoundException("Bed not found");

            if (result.patientUuid) throw new BadRequestException("Bed is already occupied");

            // update bed
            await result.update({
                patientUuid
            }, {transaction: trx, returning: true});

            return result;
        } catch (error) {
            if (!transaction) await trx.rollback();
            throw error;
        }
    }

    static async updateBed(uuid, data) {
        try {
            const user = Context.get(CTX_AUTHOR);
            return await sequelizeInstance.transaction(async t => {
                // Get room data
                const dataRuangan = await RuanganRepository.getById(uuid);
                if (!dataRuangan) throw new Error("Room not found");

                // Find existing beds
                const existingBeds = await RoomMonitoringModel.findAll({
                    where: {
                        room_uuid: uuid,
                        faskesUuid: user.faskesUuid,
                        deletedAt: {[Op.is]: null}
                    },
                    transaction: t
                });

                // Collect UUIDs from incoming data
                const incomingUuids = data.map(bed => bed.uuid).filter(uuid => uuid !== null);

                // Delete beds that are not in the incoming data
                for (const bed of existingBeds) {
                    if (!incomingUuids.includes(bed.uuid)) {
                        await bed.destroy({transaction: t});
                    }
                }

                // Update existing beds or create new ones
                for (const bedData of data) {
                    if (bedData.uuid) {
                        await RoomMonitoringModel.update(
                            {
                                bed_name: bedData.bed_name,
                                no_bed: bedData.no_bed
                            },
                            {
                                where: {
                                    uuid: bedData.uuid,
                                    room_uuid: uuid,
                                    faskesUuid: user.faskesUuid
                                },
                                transaction: t
                            }
                        );
                    } else {
                        await RoomMonitoringModel.create(
                            {
                                roomUuid: uuid,
                                roomCategory: dataRuangan.dataValues.kategori_ruangan.dataValues.name,
                                roomClass: dataRuangan.dataValues.kelasRuangan,
                                room: dataRuangan.dataValues.name,
                                faskesUuid: user.faskesUuid,
                                bedName: bedData.bed_name,
                                noBed: bedData.no_bed
                            },
                            {transaction: t}
                        );
                    }
                }

                const updatedBeds = await RoomMonitoringModel.findAll({
                    where: {
                        room_uuid: uuid,
                        faskesUuid: user.faskesUuid,
                        deletedAt: {[Op.is]: null}
                    },
                    transaction: t
                });

                return {
                    updatedBeds,
                    room: dataRuangan
                };
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


}