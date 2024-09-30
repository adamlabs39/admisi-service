import HistoryBedListener from "./history-bed-listener.js";
import NewbornListener from "./newborn-listener.js";
import LogPelayananListener from "./log-pelayanan-listener.js";

export default class EventListener{
    static init(){
        HistoryBedListener.registerEvent();
        NewbornListener.registerEvent();
        LogPelayananListener.registerEvent();
    }
}