import MonitoringRoomRepository from "../repositories/monitoring-room-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import ZodValidator from "../validations/zod-validator.js";
import MonitoringRoomValidation from "../validations/monitoring-room-validation.js";
import BadRequestException from "../exception/bad-request-exception.js";

export default class MonitoringRoomService{
    static async getAllRoom(args){
        const data = await MonitoringRoomRepository.getAllRoom(args);
        if(!data) throw new Error("Failed get all room");
        return data;
    }

    static async getDetail(uuid){
        const data = await MonitoringRoomRepository.getDetail(uuid);
        if(!data) throw new NotfoundException("Room not found");
        return data;
    }

    static async updateBed(uuid,data){
        const validData = ZodValidator.validate(MonitoringRoomValidation.UPDATE_ROOM, data);
        if(!validData) throw new BadRequestException("Bad Request");
        const result = await MonitoringRoomRepository.updateBed(uuid,data);
        if(!result) throw new Error("Failed update bed");
        return result;
    }
}