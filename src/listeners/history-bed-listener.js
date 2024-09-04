import { eventEmitter } from "../helper/event.js";
import {HISTORY_BED_CHANNEL} from "../constant/event-constant.js";
import {bannerChannel} from "../helper/utility.js";
import RiwayatRuanganRepository from "../repositories/riwayat-ruangan-repository.js";

export default class HistoryBedListener{
    static registerEvent() {
        eventEmitter.on(HISTORY_BED_CHANNEL, this.handleEvent);
    }


    static async handleEvent(data) {
        try{
            bannerChannel(HISTORY_BED_CHANNEL, data);
            await RiwayatRuanganRepository.addHistory(data);
        }catch (e){
            console.log("Error on HistoryBedListener");
            console.log(e);
        }
    }
}