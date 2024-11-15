import ZodValidator from "../validations/zod-validator.js";
import PatientValidation from "../validations/patient-validation.js";
import PatientRepository from "../repositories/patient-repository.js";
import {convertSnakeToCamel} from "../helper/utility.js";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import {Context as Ctx} from "../middlewares/context.js";
import LogPelayananRepository from "../repositories/log-pelayanan-repository.js";

export default class PatientService{
    static async create(data){
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(PatientValidation.PATIENT_VALIDATOR, data);
        if(!validData) throw new BadRequestException("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');
        const patient = await PatientRepository.registPatient(validData);
        if(!patient) throw new Error("failed create patient");

        return { message: "Berhasil Mendaftarkan Pasien" };
    }

    static async update(uuid,data){

        const validData = ZodValidator.validate(PatientValidation.PATIENT_VALIDATOR, data);
        if(!validData) throw new BadRequestException("Bad Request");

        const checkPatientExist = await PatientRepository.getPatientByUuid(uuid);
        if(!checkPatientExist) throw new NotfoundException("Pasien Tidak Ditemukan");
        validData.patient_uuid = uuid;
        const patient = await PatientRepository.registPatient(convertSnakeToCamel(validData));
        if(!patient) throw new Error("failed update patient");
        return { message: "Berhasil Mengubah Pasien" };

    }

    static async delete(uuid){
        return PatientRepository.deletePatient(uuid);
    }

    static async findByUuid(uuid){
        const data = await PatientRepository.getPatientByUuid(uuid);
        if(!data) throw new NotfoundException("Pasien Tidak Ditemukan")
        return data;
    }

    static async findAll(args){
        return PatientRepository.getAllPatient(args);
    }

    static getHistoryPatient(uuid, args){
        return LogPelayananRepository.GetHistoryPemeriksaan(uuid, args);
    }
}