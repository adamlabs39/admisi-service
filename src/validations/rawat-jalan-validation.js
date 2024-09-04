import { z } from "zod";

export default class RawatJalanValidation {
    static CREATE = z.object({
        patient_data: z.object({
            patient_uuid: z.nullable(z.string().max(255)),
            title: z.string().max(255),
            name: z.string().max(255),
            identity: z.string().max(255).nullable(),
            no_identity: z.string().max(255).nullable(),
            birth_detail: z.object({
                birth_place: z.string().max(150),
                birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                    message: "Invalid date format"
                }).transform(value => new Date(value)),
            }),
            gender: z.string().max(15),
            phone: z.string().max(15).nullable(),
            religion: z.string().max(25).nullable(),
            language: z.string().max(50).nullable(),
            maritialStatus: z.string().max(50).nullable(),
            mother_name: z.string().max(255),
            address: z.object({
                address_uuid: z.nullable(z.string().max(255).optional()),
                prov: z.string().max(150),
                city: z.string().max(150),
                district: z.string().max(150),
                rt: z.string().max(150),
                rw: z.string().max(150),
                full_address: z.string().max(255),
                country: z.string().max(150),
                village: z.string().max(150),
                postal_code: z.string().max(150),
            })
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        polyclinic: z.string().max(255),
        dpjp: z.string().max(255),
        complaint: z.string().max(255),
        note: z.string().max(255),
        maternity: z.boolean().default(false),
        platform: z.enum(["ADMISI", "APM", "MOBILE"]).default("ADMISI").optional(),
        assurance_account_id: z.string().max(255).optional()
    });

    static cancelVisit = z.object({
        list_uuid: z.array(z.string().max(255)),
        cancel_reason: z.string().max(255)
    })
}
