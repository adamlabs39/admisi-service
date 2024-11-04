import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import ZodValidator from "../validations/zod-validator.js";
import InstallasiGawatDaruratValidation from "../validations/installasi-gawat-darurat-validation.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import InstallasiGawatDaruratRepository from "../repositories/installasi-gawat-darurat-repository.js";
import BadRequestException from "../exception/bad-request-exception.js";

export default class InstallasiGawatDaruratService{
    static async registIGD(data){
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const fakes = await FaskesRepository.getFaskesByUuid(faskesUuid);
        if(!fakes) throw new Error("Faskes not found");

        let validData;
        const validator = data.without_identity
            ? InstallasiGawatDaruratValidation.IGD_VALIDATOR_REGISTRATION_WITHOUT_IDENTITY
            : data.is_newborn
                ? InstallasiGawatDaruratValidation.IGD_VALIDATOR_NEW_BORN
                : InstallasiGawatDaruratValidation.IGD_VALIDATOR_REGISTRATION;

        validData = ZodValidator.validate(validator, data);
        if(validData.payment_method === "ASURANSI" && !validData.assurance_account_id) throw new BadRequestException("Assurance account id is required");


        const result = await InstallasiGawatDaruratRepository.registIGD(validData);
        if (!result) throw new Error("Failed to create IGD");

        return result;
    }

    static async updateIGD(uuid, data){
        const {faskesUuid} = Context.get(CTX_AUTHOR);
        const fakes = await FaskesRepository.getFaskesByUuid(faskesUuid);
        if(!fakes) throw new Error("Faskes not found");

        let validData;
        const validator = data.without_identity
            ? InstallasiGawatDaruratValidation.IGD_VALIDATOR_REGISTRATION_WITHOUT_IDENTITY
            : data.is_newborn
                ? InstallasiGawatDaruratValidation.IGD_VALIDATOR_NEW_BORN
                : InstallasiGawatDaruratValidation.IGD_VALIDATOR_REGISTRATION;

        validData = ZodValidator.validate(validator, data);
        if(validData.payment_method === "ASURANSI" && !validData.assurance_account_id) throw new BadRequestException("Assurance account id is required");
        const result = await InstallasiGawatDaruratRepository.updateIgd(uuid, validData);
        if (!result) throw new Error("Failed to update IGD");

        return result;
    }

    static async getAll(args){
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }

        return await InstallasiGawatDaruratRepository.getAll(args);
    }


    static async getDetail(uuid){
        const result = await InstallasiGawatDaruratRepository.getDetail(uuid);
        if(!result) throw new Error("Data not found");

        return result;
    }

    static async cancelVisit(data){
        const validData = ZodValidator.validate(InstallasiGawatDaruratValidation.CANCELVISIT, data);
        if (!validData) throw new Error("Bad Request");

        const result = await InstallasiGawatDaruratRepository.cancelVisitIGD(validData);
        if (!result) throw new Error("Failed to cancel visit");

        return result;
    }
}