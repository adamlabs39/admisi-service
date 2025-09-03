import AntrianCallRepository from "../repositories/antrian-call-repository.js";
import AntrianCallValidation from "../validations/antrian-call-validator.js";
import ZodValidator from "../validations/zod-validator.js";

export default class AntrianCallService {
    static async getAllAntrianCall(args){
        return await AntrianCallRepository.getAllAntrianCall({ status_panggilan: args.status_panggilan, pelayanan: args.pelayanan });
    }

    static async updateAntrianCall(uuid, data){
        const validData = ZodValidator.validate(AntrianCallValidation.UPDATE_STATUS_ANTRIAN, data);
        if (!validData) throw new Error("Data tidak Valid");
        return await AntrianCallRepository.updateAntrianCall(uuid, validData);
    }
}