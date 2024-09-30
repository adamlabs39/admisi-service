import {eventEmitter} from "../helper/event.js";
import {LOG_CANCLE_PELAYANAN_CHANNEL, LOG_PELAYANAN_CHANNEL} from "../constant/event-constant.js";
import {bannerChannel} from "../helper/utility.js";
import ZodValidator from "../validations/zod-validator.js";
import EventValidation from "../validations/event-validation.js";
import LogPelayananRepository from "../repositories/log-pelayanan-repository.js";

export default class LogPelayananListener{
    static registerEvent() {
        eventEmitter.on(LOG_PELAYANAN_CHANNEL, this.handleEvent);
        eventEmitter.on(LOG_CANCLE_PELAYANAN_CHANNEL, this.handleCancelEvent);
    }

    static async handleEvent(data) {
        try{
            const validData = ZodValidator.validate(EventValidation.LOGPELAYANAN, data);
            bannerChannel(LOG_PELAYANAN_CHANNEL, data);
            await LogPelayananRepository.LogPelayanan(validData);
        }catch (e){
            console.log("Error on LogPelayananListener");
            console.log(e);
        }
    }

    static async handleCancelEvent(data) {
        try{
            const validData = ZodValidator.validate(EventValidation.CANCELLOGPELAYANAN, data);
            bannerChannel(LOG_CANCLE_PELAYANAN_CHANNEL, data);
            await LogPelayananRepository.cancelVisitLogPelayanan(validData);
        }catch (e){
            console.log("Error on LogPelayananListener");
            console.log(e);
        }
    }
}