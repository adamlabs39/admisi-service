import { eventEmitter } from "../helper/event.js";
import { NEW_BORN_CHANNEL } from "../constant/event-constant.js";
import { bannerChannel } from "../helper/utility.js";
import newBornRepository from "../repositories/newborn-repository.js";

export default class NewbornListener{
    static registerEvent() {
        eventEmitter.on(NEW_BORN_CHANNEL, this.handleEvent);
    }


    static async handleEvent(data) {
        bannerChannel(NEW_BORN_CHANNEL, data);
        await newBornRepository.upsertNewBorn(data);
    }
}