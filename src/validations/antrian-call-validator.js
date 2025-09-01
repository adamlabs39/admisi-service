import { z } from "zod";

export default class AntrianCallValidation {
    static UPDATE_STATUS_ANTRIAN =  z.object({
        status_panggilan: z.number({ required_error: "Status panggilan perlu diisi" }).max(255),
    });
}