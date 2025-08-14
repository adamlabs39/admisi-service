import PatientService from "../services/patient-service.js";
import successResponse from "../responses/success-response.js";
import BadRequestException from "../exception/bad-request-exception.js";
import XLSX from "xlsx";
export default class PatientController {
    static async create(req, res, next) {
        try {
            const patient = await PatientService.create(req.body);
            return res.status(201).json(successResponse(patient.message));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const patient = await PatientService.update(req.params.uuid, req.body);
            return res.status(200).json(successResponse(patient.message));
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const patient = await PatientService.delete(req.params.uuid);
            return res.status(200).json(successResponse("Berhasil Menghapus Pasien", patient.message));
        } catch (error) {
            next(error);
        }
    }

    static async findByUuid(req, res, next) {
        try {
            const patient = await PatientService.findByUuid(req.params.uuid);
            return res.status(200).json(successResponse("Berhasil Menampilkan Pasien", patient));
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req, res, next) {
        try {
            const patient = await PatientService.findAll(req.query);
            return res.status(200).json(successResponse("Berhasil Menampilkan Pasien", patient.data, patient.pagination));
        } catch (error) {
            next(error);
        }
    }


    static async getHistoryPatient(req, res, next) {
        try {
            const patient = await PatientService.getHistoryPatient(req.params.uuid, req.query);
            return res.status(200).json(successResponse("Berhasil Menampilkan Riwayat Pasien", patient.data, patient.pagination));
        }catch (error) {
            next(error);
        }
    }

    static async createPatientFile(req, res, next) {
        try {
            const file = req.files?.unggah_berkas || null;
            const patientFile = await PatientService.createPatientFile(req.params.uuid, { unggah_berkas: file });

            return res.status(201).json(successResponse("Berhasil Menambah File Pasien", patientFile));
        } catch (error) {
            next(error);
        }
    }

    static async deletePatientFile(req, res, next) {
        try {
            const patient = await PatientService.deletePatientFile(req.params.uuid);
            return res.status(200).json(successResponse("Berhasil Menghapus File Pasien", patient));
        } catch (error) {
            next(error);
        }
    }

    static async getPatientFile(req, res, next) {
        try {
            const patient = await PatientService.getPatientFile(req.params.uuid);
            return res.status(200).json(successResponse("Berhasil Mendapatkan File Pasien", patient));
        } catch (error) {
            next(error);
        }
    }

    static async checkPatientExist(req, res, next) {
        try {
            const patient = await PatientService.checkPatientExist(req.body);
            if (!patient) {
                return res.status(404).json(successResponse("Pasien belum terdaftar", { noRm: null }));
            }
            return res.status(200).json(successResponse("Data berhasil dicek", patient));
        } catch (error) {
            next(error);
        }
    }

    static async import(req,res,next) {
        try{
            const file = req.files?.file || null;
            if(!file) throw new BadRequestException("Tidak ada file yang diupload");
            const availableMimeTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
            if(!availableMimeTypes.includes(file.mimetype)) throw new BadRequestException("File yang diupload bukan file excel");
            if(!file) throw new BadRequestException("Tidak ada file yang diupload");
            const wb = XLSX.read(file.data, {type: 'buffer'});
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, {raw: true, defval: null});
            const result = await PatientService.import(data);

            return res.status(200).json(successResponse(result.message));
        }catch (error) {
            next(error);
        }
    }
}