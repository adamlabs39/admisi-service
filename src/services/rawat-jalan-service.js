import RawatJalanRepository from "../repositories/rawat-jalan-repository.js";
import RawatJalanValidation from "../validations/rawat-jalan-validation.js";
import {checkExistData, convertSnakeToCamel,} from "../helper/utility.js";
import FaskesRepository from "../repositories/faskes-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import NotfoundException from "../exception/notfound-exception.js";
import {Context as Ctx} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import BadRequestException from "../exception/bad-request-exception.js";
import RawatJalanModel from "../models/rawat-jalan-model.js";
import AsuransiValidator from "../validations/asuransi-validator.js";
import JadwalDokterRepository from "../repositories/jadwal-dokter-repository.js";

export class RawatJalanService {
    static async getAll(args, faskesUuidMobile) {
        if(!args.start_date || !args.end_date){
            throw new BadRequestException("Start date and end date is required");
        }
        return await RawatJalanRepository.getAll(args, faskesUuidMobile);
    }

    static async getRawatJalanToday(faskesUuidMobile) {
        return await RawatJalanRepository.getRawatJalanToday(faskesUuidMobile);
    }

    static async registRawatJalan(data) {
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(RawatJalanValidation.RAJAL_VALIDATOR, data);
        if(validData.payment_method === "ASURANSI" && !validData.insurance) throw new BadRequestException("Insurance data is required");

        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');
        const result = await RawatJalanRepository.create(validData);
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }

    static async registRawatJalanApm(data) {
        const user = Ctx.get(CTX_AUTHOR);
        const validData = ZodValidator.validate(RawatJalanValidation.RAJAL_APM_VALIDATOR, data);
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const result = await RawatJalanRepository.createApm(validData);
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }

    static async registRawatJalanMobile(data, faskesUuid) {
        const validData = ZodValidator.validate(RawatJalanValidation.RAJAL_MOBILE_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Validasi gagal");
        const result = await RawatJalanRepository.createMobile(validData, faskesUuid);
        if (!result) throw new Error("Gagal membuat rawat jalan mobile");

        return result;
    }

    static async checkBookingRajal(data) {
        const validData = ZodValidator.validate(RawatJalanValidation.CHECK_KODE_BOOKING_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Validasi gagal");
        const result = await RawatJalanRepository.checkBookingRajal(validData);
        return result;
    }

    static async getRajalBooking(data) {
        const validData = ZodValidator.validate(RawatJalanValidation.CHECK_KODE_BOOKING_VALIDATOR, data);
        if (!validData) throw new BadRequestException("Validasi gagal");
        const result = await RawatJalanRepository.getBookingRajal(validData);
        return result;
    }

    static async updateRawatJalan(uuid, data) {
        const user = Ctx.get(CTX_AUTHOR);
        const checkExist = await checkExistData(RawatJalanModel, uuid);
        if(!checkExist) throw new NotfoundException('Data tidak ditemukan');

        let validData;

        //* Check platform untuk validasi
        if (data.platform === "APM") {
            validData = ZodValidator.validate(RawatJalanValidation.RAJAL_APM_VALIDATOR, data);
            if (!validData) throw new BadRequestException("Bad Request");
        } else if (data.platform === "MOBILE") {
            validData = ZodValidator.validate(RawatJalanValidation.RAJAL_MOBILE_VALIDATOR, data);
            if (!validData) throw new BadRequestException("Bad Request");
        } else {
            validData = ZodValidator.validate(RawatJalanValidation.RAJAL_VALIDATOR, data);
            if (!validData) throw new BadRequestException("Bad Request");
            if (validData.payment_method === "ASURANSI" && !validData.insurance) throw new BadRequestException("Insurance data is required");
        }
        
        const faskes = await FaskesRepository.getFaskesByUuid(user.faskesUuid);
        if (!faskes) throw new NotfoundException('Faskes tidak ditemukan');

        const result = await RawatJalanRepository.update(uuid, validData);
        if (!result) throw new Error("Failed to create rawat jalan");

        return result;
    }


    static async cancelVisit(data){
        const validData = ZodValidator.validate(RawatJalanValidation.cancelVisit, data);
        if (!validData) throw new BadRequestException("Bad Request");
        const result = await RawatJalanRepository.cancelVisit(validData);
        if (!result) throw new Error("Failed to cancel visit");
        return result;
    }


    static async getDetail(uuid){
        const result = await RawatJalanRepository.getOne(uuid);
        if(!result) throw new BadRequestException("Data not found");
        console.log("Detail Pasien: ", result);
        return result;
    }

    static async getAllJadwalDokter(){
        return await JadwalDokterRepository.getAllJadwalDokter();
    }

}