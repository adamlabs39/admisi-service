import {eventEmitter} from "../helper/event.js";
import {INSURANCE_ADMISSION_CHANNEL} from "../constant/event-constant.js";

export default class InsuranceAdmissionListener{
    static async registerEvent() {
        eventEmitter.on(INSURANCE_ADMISSION_CHANNEL, this.handleEvent);
    }

    static async handleEvent(data) {
    }
}