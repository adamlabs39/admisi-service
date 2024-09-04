import { eventEmitter } from "../helper/event.js";

export default class TestListener{
    static registerEvent() {
        eventEmitter.on(TEST_CHANNEL, this.handleEvent);
    }


    static async handleEvent(data) {
        console.log("Event Received\n");
        console.log("Data : ", data);
    }
}