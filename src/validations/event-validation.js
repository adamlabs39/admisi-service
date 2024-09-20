import { z } from 'zod';
export default class EventValidation{
    static NEWBORN = z.object({
        identifier_mom: z.string().max(255),
        name_mom: z.string().max(255),
        name_baby: z.string().max(255),
        no_rm_baby: z.string().max(150),
        birth_detail_uuid: z.string().max(255),
        birth_time_baby: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
            message: "Invalid time format, expected HH:mm:ss"
        }),
        gender_baby: z.string().max(15),
        multiple_birth: z.boolean().default(false),
        address_uuid: z.string().max(255),
        tanggal_daftar: z.number().int(),
        status: z.boolean().default(true)
    });
}