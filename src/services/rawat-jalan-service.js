import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {
    convertSnakeToCamel,
    generateNoReg,
    generateNoRM,
    getInfoAge
} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import PatientRepository from "../repositories/patient-repository.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import PatientValidation from "../validations/patient-validation.js";
import BadRequestException from "../exception/bad-request-exception.js";
import moment from "moment";
import newBornRepository from "../repositories/newborn-repository.js";

export class RawatJalanService {
    static async getALl(args) {
        const data = await RawatJalanRepository.getAll(args);
        console.log(data);
        return data;
    }

    static async registRawatJalan(data) {
        const user = Ctx.get(CTX_AUTHOR);

        let validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        if (!validData) throw new BadRequestException("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        if (validData.is_newborn && Array.isArray(validData.patient_data)) {
            // Convert data to camelCase and pass to repository
            const newbornData = validData.patient_data.map(patient => {
                patient.faskesUuid = faskes.uuid;
                patient.address.faskesUuid = faskes.uuid;
                patient.birth_detail.faskesUuid = faskes.uuid;
                patient.birth_detail = convertSnakeToCamel(patient.birth_detail);
                patient.faskes_code = faskes.code;
                return convertSnakeToCamel(patient);
            });
            validData = convertSnakeToCamel(validData);
            const result = await RawatJalanRepository.registNewBorn(newbornData, validData);
            if (!result) throw new Error("Failed to create rawat jalan for newborn");

            return result;

        } else {
            // Handle non-newborn patients
            const patientData = convertSnakeToCamel(validData.patient_data);
            patientData.faskesUuid = faskes.uuid;
            patientData.address.faskesUuid = faskes.uuid;
            patientData.birthDetail.faskesUuid = faskes.uuid;
            patientData.faskes_code = faskes.code;
            patientData.birthDetail = convertSnakeToCamel(patientData.birthDetail);
            validData = convertSnakeToCamel(validData);
            const result = await RawatJalanRepository.registSinglePatient(patientData, validData);
            if (!result) throw new Error("Failed to create rawat jalan");

            return result;
        }
    }


}