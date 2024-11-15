import ZodValidator from "../validations/zod-validator.js";
import GeneralConsentValidation from "../validations/general-consent-validation.js";
import GeneralConsentRepository from "../repositories/general-consent-repository.js";
import {convertSnakeToCamel} from "../helper/utility.js";
import NotfoundException from "../exception/notfound-exception.js";

export default class GeneralConsentService{
    static async create(uuid,data){
        const validData = ZodValidator.validate(GeneralConsentValidation.CREATE, data);
        if (!validData) throw new Error("Bad Request");
        const result = await GeneralConsentRepository.create(uuid, convertSnakeToCamel(validData));
        if(!result) throw new Error("Failed to create general consent");
        return result;
    }

    static async get(uuid){
        const result = await GeneralConsentRepository.getAllByPatient(uuid);
        if(!result) throw new Error("Failed to get general consent");
        return result;
    }

    static async getDetail(uuid){
        const result = await GeneralConsentRepository.getDetail(uuid);
        if(!result) throw new NotfoundException("General Consent not found");
        return result;
    }


    static async delete(uuid){
        if(!uuid) throw new NotfoundException("General Consent not found");
        const result  = await GeneralConsentRepository.delete(uuid);
        if(!result) throw new Error("Failed to delete general consent");
        return result;
    }
}