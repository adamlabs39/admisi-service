import { eventEmitter } from "../helper/event.js";
import { NEW_BORN_CHANNEL } from "../constant/event-constant.js";
import { bannerChannel } from "../helper/utility.js";
import newBornRepository from "../repositories/newborn-repository.js";
import ZodValidator from "../validations/zod-validator.js";
import EventValidation from "../validations/event-validation.js";

export default class NewbornListener{
    static registerEvent() {
        eventEmitter.on(NEW_BORN_CHANNEL, this.handleEvent);
    }

    static async handleEvent(data) {
        const validData = ZodValidator.validate(EventValidation.NEWBORN, data);
        bannerChannel(NEW_BORN_CHANNEL, validData);
        await newBornRepository.upsertNewBorn(validData);
    }
}