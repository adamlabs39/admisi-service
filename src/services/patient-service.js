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
import moment from "moment";

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

    static async checkPatientExist(data){
        const validData = ZodValidator.validate(PatientValidation.CHECK_IDENTITY_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const result = await PatientRepository.checkExistPatient(validData);
        return result;
    }

    static async import(data) {
        const result = [];
        data.map((item, index) => {
            const patientData = this.mapPatientData(item);
            console.log(patientData);
            const validData = ZodValidator.validate(PatientValidation.PATIENT_IMPORT_VALIDATOR, patientData);
            if (!validData) throw new BadRequestException("Error on row " + (index + 1));
            result.push(validData);
        });

        return await PatientRepository.importData(result);

    }



    static mapPatientData(rawData) {
        return {
            no_rm: rawData["No_RM*"]?.toString() || "",
            title: rawData["Awalan_atau_Gelar*"] || "",
            name: rawData["Nama_Lengkap*"] || "",
            identity: rawData["Identitas*"] || "",
            no_identity: rawData["No_Identitas*"]?.toString() || "",
            birth_detail: {
                birth_place: rawData["Tempat_Lahir*"] || "",
                birth_date: rawData["Tanggal_Lahir*"] ? moment(rawData["Tanggal_Lahir*"]).format("YYYY-MM-DD") : ""
            },
            gender: rawData["Jenis_Kelamin*"] === "Perempuan" ? "Female" : "Male",
            phone: rawData["No_HP*"]?.toString() || "",
            religion: rawData["Agama"] || "",
            language: rawData["Bahasa_yang_Dikuasai"] || "",
            maritial_status: rawData["Status_Pernikahan*"] || "",
            mother_name: rawData["Nama_Ibu_Kandung"] || "",
            address: {
                prov: rawData["Provinsi*"] || "",
                city: rawData["Kabupaten_atau_Kota*"] || "",
                district: rawData["Kecamatan*"] || "",
                village: rawData["Kelurahan_atau_Desa*"] || "",
                rt: rawData["RT*"]?.toString() || "",
                rw: rawData["RW*"]?.toString() || "",
                postal_code: rawData["Kode_Pos*"]?.toString() || "",
                full_address: rawData["Alamat *"] || "",
                country: rawData["Negara*"] || "Indonesia"
            }
        };
    }
}
