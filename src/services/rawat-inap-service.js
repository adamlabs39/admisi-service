import ZodValidator from "../validations/zod-validator.js";
import RawatInapValidation from "../validations/rawat-inap-validation.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {checkExistData, convertSnakeToCamel} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import RawatInapRepository from "../repositories/rawat-inap-repository.js";
import RawatInapModel from "../models/rawat-inap-model.js";
import BadRequestException from "../exception/bad-request-exception.js";

export default class RawatInapService{
    static async registRI(data){
        const user = Context.get(CTX_AUTHOR);

        let validData = ZodValidator.validate(RawatInapValidation.CREATE, data);
        if (!validData) throw new Error("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        validData = convertSnakeToCamel(validData);
        const result = await RawatInapRepository.registBaby(validData);
        if (!result) throw new Error("Failed to create rawat inap");
        return result;
    }


    static async update(uuid, data){
        const user = Context.get(CTX_AUTHOR);

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const schema = data.is_newborn ? RawatInapValidation.UPDATE_NEWBORN : RawatInapValidation.UPDATE_PATIENT;
        let validData = ZodValidator.validate(schema, data);
        if (!validData) throw new Error("Bad Request");

        const checkExist = await checkExistData(RawatInapModel, uuid);
        if(!checkExist) throw new NotfoundException('Rawat Inap tidak ditemukan');

        const result = await RawatInapRepository.updateRawatInap(uuid, validData);
        if (!result) throw new Error("Failed to create rawat inap");

        return result;
    }


    static async getAll(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }
        return await RawatInapRepository.getAll(args);
    }


    static async getDetail(uuid){
        const result = await RawatInapRepository.getDetail(uuid);
        if(!result) throw new Error("Data not found");
        return result;
    }

    static async cancelVisitRawatInap(data){
        const validData = ZodValidator.validate(RawatInapValidation.CANCELVISIT, data);
        if (!validData) throw new Error("Bad Request");

        const result = await RawatInapRepository.cancelVisit(validData);
        if (!result) throw new Error("Failed to cancel visit");
        return result;
    }
}