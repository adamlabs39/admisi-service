import MonitoringRoomService from "../services/monitoring-room-service.js";
import successResponse from "../responses/success-response.js";

export default class MonitoringRoomController{
    static async getAllRoom(req, res, next){
        try{
            const data = await MonitoringRoomService.getAllRoom(req.query);
            return res.status(200).json(successResponse("Success get all room", data.data, data.pagination));
        }catch (error){
            console.log(error);
            next(error);
        }
    }


    static async getDetailRoom(req,res, next){
        try{
            const data = await MonitoringRoomService.getDetail(req.params.uuid);
            return res.status(200).json(successResponse("Success get detail room", data));
        }catch(error){
            console.log(error);
            next(error);
        }
    }

    static async updateBed(req,res,next){
        try{
            const data = await MonitoringRoomService.updateBed(req.params.uuid, req.body);
            return res.status(200).json(successResponse("Success update bed"));
        }catch (error){
            console.log(error);
            next(error);
        }
    }
}