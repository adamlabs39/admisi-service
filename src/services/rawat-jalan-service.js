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

export class RawatJalanService {
    static async getALl(args) {
        const data = await RawatJalanRepository.getAll(args);
        console.log(data);
        return data;
    }

    // static async registRawatJalan(data) {
    //     const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
    //     const user = Ctx.get(CTX_AUTHOR);
    //     const infoAge = getInfoAge(validData.patient_data.birth_date);
    //
    //     // Registrasi Pasien
    //     const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
    //     if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');
    //
    //     Object.assign(validData.patient_data.address, {
    //         faskesUuid: faskes.uuid,
    //         status: true,
    //         fullAddress: validData.patient_data.address.full_address,
    //     });
    //
    //     Object.assign(validData.patient_data, {
    //         faskes_uuid: faskes.uuid,
    //         no_rm: generateNoRM(faskes.code),
    //         age_year: infoAge.year,
    //         age_month: infoAge.month,
    //         age_day: infoAge.day,
    //         status: true
    //     });
    //
    //     const patient = await PatientRepository.registPatient(convertSnakeToCamel(validData.patient_data));
    //     if (!patient) throw new Error("Failed to create patient");
    //
    //     // DEFAULT DATA
    //     const dataRJ = {
    //         faskesUuid: faskes.uuid,
    //         noReg: generateNoReg(),
    //         patientUuid: patient.uuid,
    //         name: validData.patient_data.name,
    //         noRm: validData.patient_data.no_rm,
    //         birthDate: validData.patient_data.birth_date,
    //         ageYear: validData.patient_data.age_year,
    //         ageMonth: validData.patient_data.age_month,
    //         ageDay: validData.patient_data.age_day,
    //         gender: validData.patient_data.gender,
    //         doctor: validData.dpjp,
    //         maternity: validData.maternity,
    //         newBorn: validData.is_newborn,
    //         note: validData.note,
    //         polyclinic: validData.polyclinic,
    //         complaint: validData.complaint,
    //         platform: validData.platform
    //     };
    //
    //     if (validData.payment_method === 'TUNAI') {
    //         const dataTunai = await RawatJalanRepository.registTunai(dataRJ);
    //         if (!dataTunai) throw new Error("Failed to create rawat jalan");
    //         return dataTunai;
    //     }
    //
    //     if (validData.payment_method === 'ASURANSI') {
    //         dataRJ.insurance = validData.assurance_account_id;
    //         const dataAsuransi = await RawatJalanRepository.registAsuransi(dataRJ);
    //         if (!dataAsuransi) throw new Error("Failed to create rawat jalan");
    //         return dataAsuransi;
    //     }
    //
    //     if(validData.is_newborn){
    //
    //     }
    //     return patient;
    // }


    static async registRawatJalan(data) {
        const user = Ctx.get(CTX_AUTHOR);

        const validData = ZodValidator.validate(RawatJalanValidation.CREATE, data);
        if (!validData) throw new BadRequestException("Bad Request");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        // Helper function untuk membuat data rawat jalan
        const createRawatJalanData = (patient) => ({
            faskesUuid: faskes.uuid,
            noReg: generateNoReg(),
            patientUuid: patient.uuid,
            name: patient.name,
            noRm: patient.noRm,
            birthDetailUuid: patient.birthDetailUuid,
            gender: patient.gender,
            doctor: validData.dpjp,
            maternity: validData.maternity,
            newBorn: validData.is_newborn,
            note: validData.note,
            polyclinic: validData.polyclinic,
            complaint: validData.complaint,
            platform: validData.platform
        });

        if (validData.is_newborn && Array.isArray(validData.patient_data)) {
            for (const patient of validData.patient_data) {
                patient.faskesUuid = faskes.uuid;
                patient.address.faskesUuid = faskes.uuid;
                patient.birth_detail.faskesUuid = faskes.uuid;
                patient.birth_detail = convertSnakeToCamel(patient.birth_detail);
                patient.faskes_code = faskes.code;

                const newPatient = await PatientRepository.registPatient(convertSnakeToCamel(patient));
                if (!newPatient) throw new Error("Failed to create patient for newborn");

                const dataRJ = createRawatJalanData(newPatient);

                if (validData.payment_method === 'TUNAI') {
                    const dataTunai = await RawatJalanRepository.registTunai(dataRJ);
                    if (!dataTunai) throw new Error("Failed to create rawat jalan for newborn");
                    return dataTunai;
                }

                if (validData.payment_method === 'ASURANSI') {
                    dataRJ.insurance = validData.assurance_account_id;
                    const dataAsuransi = await RawatJalanRepository.registAsuransi(dataRJ);
                    if (!dataAsuransi) throw new Error("Failed to create rawat jalan for newborn");
                    return dataAsuransi;
                }
            }
        } else {
            const patientData = validData.patient_data;
            patientData.faskesUuid = faskes.uuid;
            patientData.address.faskesUuid = faskes.uuid;
            patientData.birth_detail.faskesUuid = faskes.uuid;
            patientData.birth_detail = convertSnakeToCamel(patientData.birth_detail);
            patientData.faskes_code = faskes.code;

            const patient = await PatientRepository.registPatient(convertSnakeToCamel(patientData));
            if (!patient) throw new Error("Failed to create patient");

            const dataRJ = createRawatJalanData(patient);

            if (validData.payment_method === 'TUNAI') {
                const dataTunai = await RawatJalanRepository.registTunai(dataRJ);
                if (!dataTunai) throw new Error("Failed to create rawat jalan");
                return dataTunai;
            }

            if (validData.payment_method === 'ASURANSI') {
                dataRJ.insurance = validData.assurance_account_id;
                const dataAsuransi = await RawatJalanRepository.registAsuransi(dataRJ);
                if (!dataAsuransi) throw new Error("Failed to create rawat jalan");
                return dataAsuransi;
            }

            return patient;
        }
    }



}