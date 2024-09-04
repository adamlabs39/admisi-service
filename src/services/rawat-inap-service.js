import ZodValidator from "../validations/zod-validator.js";
import RawatInapValidation from "../validations/rawat-inap-validation.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {checkExistData, convertSnakeToCamel} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import NotfoundException from "../exception/notfound-exception.js";
import RawatInapRepository from "../repositories/rawat-inap-repository.js";
import RawatInapModel from "../models/rawat-inap-model.js";

export default class RawatInapService{
    static async registRI(data){
        const user = Context.get(CTX_AUTHOR);

        let validData = ZodValidator.validate(RawatInapValidation.CREATE, data);
        if (!validData) throw new Error("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        validData.patient_data.faskesUuid = faskes.uuid;
        validData.patient_data.address.faskesUuid = faskes.uuid;
        validData.patient_data.birth_detail.faskesUuid = faskes.uuid;
        validData.patient_data.faskes_code = faskes.code;
        validData.patient_data.birth_detail = convertSnakeToCamel(validData.patient_data.birth_detail);
        validData.patient_data = convertSnakeToCamel(validData.patient_data);
        validData = convertSnakeToCamel(validData);
        const result = await RawatInapRepository.registBaby(validData);
        if (!result) throw new Error("Failed to create rawat inap");
        return result;
    }

    static async update(uuid, data){
        const user = Context.get(CTX_AUTHOR);

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        let validData = ZodValidator.validate(RawatInapValidation.UPDATE, data);
        if (!validData) throw new Error("Bad Request");

        const checkExist = await checkExistData(RawatInapModel, uuid);
        if(!checkExist) throw new NotfoundException('Rawat Inap tidak ditemukan');

        validData.patient_data.faskesUuid = faskes.uuid;
        validData.patient_data.address.faskesUuid = faskes.uuid;
        validData.patient_data.birth_detail.faskesUuid = faskes.uuid;
        validData.patient_data.faskes_code = faskes.code;
        validData.patient_data.birth_detail = convertSnakeToCamel(validData.patient_data.birth_detail);
        validData.patient_data = convertSnakeToCamel(validData.patient_data);
        validData = convertSnakeToCamel(validData);
        const result = await RawatInapRepository.registBaby(validData);
        if (!result) throw new Error("Failed to create rawat inap");

        return result;
    }
}