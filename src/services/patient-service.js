import ZodValidator from "../validations/zod-validator.js";
import PatientValidation from "../validations/patient-validation.js";
import PatientRepository from "../repositories/patient-repository.js";
import {convertSnakeToCamel, generateNoRM, getInfoAge} from "../helper/utility.js";
import NotfoundException from "../exception/notfound-exception.js";
import BadRequestException from "../exception/bad-request-exception.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import AddressRepository from "../repositories/address-repository.js";

export default class PatientService{
    static async create(user, data){
        const validData = ZodValidator.validate(PatientValidation.CREATE, data);
        if(!validData) throw new BadRequestException("Bad Request");
        const infoAge = getInfoAge(validData.birth_date);
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        validData.address.faskes_uuid = faskes.uuid;
        validData.address.status = true;
        const address = await AddressRepository.create(convertSnakeToCamel(validData.address));
        validData.faskes_uuid = faskes.uuid;
        validData.no_rm = generateNoRM(faskes.code);
        validData.age_year = infoAge.year;
        validData.age_day = infoAge.day;
        validData.age_month = infoAge.month;
        validData.status = true;
        validData.address_uuid = address.dataValues.uuid;

        const patient = PatientRepository.cretePatient(convertSnakeToCamel(validData));
        if(!patient) throw new Error("failed create patient")
        return { message: "Berhasil Membuat Pasien" };
    }

    static async update(uuid,user,data){
        const validData = ZodValidator.validate(PatientValidation.UPDATE, data);

        if(!validData) throw new BadRequestException("Bad Request");
        const infoAge = getInfoAge(validData.birth_date);

        await AddressRepository.update(data.address.address_uuid, convertSnakeToCamel(data.address))
        validData.age_year = infoAge.year;
        validData.age_day = infoAge.day;
        validData.age_month = infoAge.month;

        const patient = PatientRepository.updatePatient(uuid, convertSnakeToCamel(validData));
        if(!patient) throw new Error("failed update patient")
        return { message: "Berhasil Mengubah Pasien" };
    }

    static async delete(uuid){
        return PatientRepository.deletePatient(uuid);
    }

    static async findByUuid(uuid){
        // return PatientRepository.getPatientByUuid(uuid);
        const data = await PatientRepository.getPatientByUuid(uuid);
        if(!data) throw new NotfoundException("Pasien Tidak Ditemukan")
        return data;
    }

    static async findAll(args){
        return PatientRepository.getAllPatient(args);
    }
}