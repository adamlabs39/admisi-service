import TestListener from "./test-listener.js";
import HistoryBedListener from "./history-bed-listener.js";
import NewbornListener from "./newborn-listener.js";

export default class EventListener{
    static init(){
        HistoryBedListener.registerEvent();
        NewbornListener.registerEvent();
    }
}