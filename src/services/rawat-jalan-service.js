import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {convertSnakeToCamel, generateNoRM, getInfoAge} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import AddressRepository from "../repositories/address-repository.js";
import PatientRepository from "../repositories/patient-repository.js";

export class RawatJalanService{
    static async getALl(args) {
        return await RawatJalanRepository.getAll(args);
    }

    static async registRawatJalan(user, data) {
        const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        const infoAge = getInfoAge(validData.patient_data.birth_date);

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        let checkAddressExist = await AddressRepository.getOne(validData.patient_data.address.address_uuid);
        validData.patient_data.address.faskesUuid = faskes.uuid;
        validData.patient_data.address.status = true;
        validData.patient_data.address.fullAddress = validData.patient_data.address.full_address;
        delete validData.patient_data.address.full_address;

        const address = checkAddressExist
            ? await AddressRepository.update(validData.patient_data.address.address_uuid, validData.patient_data.address)
            : await AddressRepository.create(validData.patient_data.address);

        if (!address) throw new NotfoundException('Failed to process address.');

        delete validData.patient_data.address;

        validData.patient_data.faskes_uuid = faskes.uuid;
        validData.patient_data.no_rm = generateNoRM(faskes.code);
        validData.patient_data.age_year = infoAge.year;
        validData.patient_data.age_month = infoAge.month;
        validData.patient_data.age_day = infoAge.day;
        validData.patient_data.status = true;
        validData.patient_data.address_uuid = address.dataValues.uuid;
        validData.patient_data.doctor = validData.dpjp;
        console.log(validData.patient_data);
        const patient = await PatientRepository.registPatient(convertSnakeToCamel(validData.patient_data));

        return convertSnakeToCamel(validData.patient_data);
    }

}