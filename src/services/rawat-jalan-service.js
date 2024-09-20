import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {checkExistData, convertSnakeToCamel,} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import BadRequestException from "../exception/bad-request-exception.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";

export class RawatJalanService {
    static async getALl(args) {
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }
        return await RawatJalanRepository.getAll(args);
    }

    static async registRawatJalan(data) {
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(RawatJalanValidation.RAJAL_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');
        const result = await RawatJalanRepository.create(validData);
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }

    static async updateRawatJalan(uuid, data) {
        const user = Ctx.get(CTX_AUTHOR);
        const checkExist = await checkExistData(RawatJalanModel, uuid);
        if(!checkExist) throw new NotfoundException('Data tidak ditemukan');
        const validData = ZodValidator.validate(RawatJalanValidation.RAJAL_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const result = await RawatJalanRepository.update(uuid, validData);
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }


    static async cancelVisit(data){
        const validData = ZodValidator.validate(RawatJalanValidation.cancelVisit, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const result = await RawatJalanRepository.cancelVisit(validData);
        if (!result) throw new Error("Failed to cancel visit");
        return result;
    }


    static async getDetail(uuid){
        const result = await RawatJalanRepository.getOne(uuid);
        if(!result) throw new BadRequestException("Data not found");
        return result;
    }


}