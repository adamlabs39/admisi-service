import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {convertSnakeToCamel, generateNoReg, generateNoRM, getInfoAge} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import AddressRepository from "../repositories/address-repository.js";
import PatientRepository from "../repositories/patient-repository.js";
import moment from "moment";
import {Context} from "../middlewares/context.js";

export class RawatJalanService{
    static async getALl(args) {
        return await RawatJalanRepository.getAll(args);
    }

    static async registRawatJalan(user, data) {
        const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        const infoAge = getInfoAge(validData.patient_data.birth_date);
        // Registrasi Pasien
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');
        validData.patient_data.address.faskesUuid = faskes.uuid;
        validData.patient_data.address.status = true;
        validData.patient_data.address.fullAddress = validData.patient_data.address.full_address;
        validData.patient_data.faskes_uuid = faskes.uuid;
        validData.patient_data.no_rm = generateNoRM(faskes.code);
        validData.patient_data.age_year = infoAge.year;
        validData.patient_data.age_month = infoAge.month;
        validData.patient_data.age_day = infoAge.day;
        validData.patient_data.status = true;
        validData.patient_data.doctor = validData.dpjp;
        const patient = await PatientRepository.registPatient(convertSnakeToCamel(validData.patient_data));

        if (!patient) throw new Error("Failed create patient");

        // DEFAULT DATA
        let dataRJ = {
            faskesUuid: faskes.uuid,
            noReg: generateNoReg(),
            patientUuid: patient.uuid,
            name: validData.patient_data.name,
            noRm: validData.patient_data.no_rm,
            birthDate: validData.patient_data.birth_date,
            ageYear: validData.patient_data.age_year,
            ageMonth: validData.patient_data.age_month,
            ageDay: validData.patient_data.age_day,
            gender: validData.patient_data.gender,
            doctor: validData.dpjp,
            maternity: validData.maternity,
            newBorn: validData.is_newborn,
            note: validData.note,
            complaint: validData.complaint,
        }
        // Regist Tunai
        if(validData.payment_method === 'TUNAI') {
            const dataTunai = await RawatJalanRepository.registTunai(dataRJ);
            if(!dataTunai) throw new Error("Failed create rawat jalan");
            return dataTunai;
        }

        // Regist Asuransi
        if(validData.payment_method === 'ASURANSI') {
            dataRJ.insurance = validData.assurance_account_id;
            const dataAsuransi = await RawatJalanRepository.registAsuransi(dataRJ);
            if(!dataAsuransi) throw new Error("Failed create rawat jalan");
            return dataAsuransi;
        }

        // Regist New Born



        return patient;
    }

}