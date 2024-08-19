import {z} from "zod";

export default class MonitoringRoomValidation {
    static UPDATE_ROOM = z.array(
        z.object({
            uuid: z.string().max(255).nullable(),
            bed_name: z.string().max(255),
            no_bed: z.string().max(255),
        })
    );
}