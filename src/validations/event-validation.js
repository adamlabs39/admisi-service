import { z } from 'zod';
export default class EventValidation{
    static NEWBORN = z.object({
        identifier_mom: z.string().max(255),
        name_mom: z.string().max(255),
        name_baby: z.string().max(255),
        no_rm_baby: z.string().max(150),
        birth_detail_uuid: z.string().max(255),
        birth_time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
            message: "Invalid time format, expected HH:mm:ss"
        }),
        gender_baby: z.string().max(15),
        multiple_birth: z.boolean().default(false),
        address_uuid: z.string().max(255),
        tanggal_daftar: z.number().int(),
        status: z.boolean().default(true)
    });

    static LOGPELAYANAN = z.object({
        tgl_registrasi: z.number().int(),
        noreg: z.string().max(255),
        no_pelayanan: z.string().max(255),
        jenis_kunjungan: z.enum(["IGD", "RI", "RJ"]),
        patient_uuid: z.string().max(255),
        practitioner_uuid: z.nullable(z.string().max(255)).default(null).optional(),
        lokasi_uuid: z.nullable(z.string().max(255)).default(null).optional(),
        payment_method: z.union([z.literal(1), z.literal(2)]).default(1),
    });

    static CANCELLOGPELAYANAN = z.object({
        list_no_pelayanan: z.array(z.string().max(255)),
        cancel_reason: z.string().max(255),
        cancel_by: z.string().max(255)
    });
}