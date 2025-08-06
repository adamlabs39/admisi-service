import BadRequestException from "../exception/bad-request-exception.js";
import LogPelayananRepository from "../repositories/log-pelayanan-repository.js";
import MonitoringRoomRepository from "../repositories/monitoring-room-repository.js";
import RawatInapRepository from "../repositories/rawat-inap-repository.js";
import newBornRepository from "../repositories/newborn-repository.js";

export default class ReportService{
    static async getReport(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await LogPelayananRepository.getAllLogPelayanan(args);
    }


    static async getReportPenjamin(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await LogPelayananRepository.getAllLogPenjamin(args);
    }

    static async getCancelVisitReport(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await LogPelayananRepository.getAllCancelVisitLogPelayanan(args);
    }


    static async getReportRoom(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await LogPelayananRepository.getReportStatusKamar(args);
    }


    static async getReportNewBorn(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await newBornRepository.getReportNewBorn(args);

    }

    static async getKeperawatanInap(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await RawatInapRepository.getReport(args);
    }
}