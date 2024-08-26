import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {convertSnakeToCamel,} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import BadRequestException from "../exception/bad-request-exception.js";

export class RawatJalanService {
    static async getALl(args) {
        return await RawatJalanRepository.getAll(args);
    }

    static async registRawatJalan(data) {
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const patientData = {
            ...convertSnakeToCamel(validData.patient_data),
            faskesUuid: faskes.uuid,
            faskes_code: faskes.code,
            address: { ...validData.patient_data.address, faskesUuid: faskes.uuid },
            birthDetail: { ...convertSnakeToCamel(validData.patient_data.birth_detail), faskesUuid: faskes.uuid },
        };

        const result = await RawatJalanRepository.processRJ('create',null, patientData, convertSnakeToCamel(validData));
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }

    static async updateRawatJalan(uuid, data) {
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const patientData = {
            ...convertSnakeToCamel(validData.patient_data),
            faskesUuid: faskes.uuid,
            faskes_code: faskes.code,
            address: { ...validData.patient_data.address, faskesUuid: faskes.uuid },
            birthDetail: { ...convertSnakeToCamel(validData.patient_data.birth_detail), faskesUuid: faskes.uuid },
        };

        const result = await RawatJalanRepository.processRJ('update',uuid, patientData, convertSnakeToCamel(validData));
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }



    static async getDetail(uuid){
        const result = await RawatJalanRepository.getOne(uuid);
        if(!result) throw new BadRequestException("Data not found");
        return result;
    }


}