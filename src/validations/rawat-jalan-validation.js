import { z } from 'zod';

export default class RawatJalanValidation {
    static CREATE = z.object({
        is_newborn: z.boolean().default(false),
        patient_data: z.object({
            patient_uuid: z.nullable(z.string().max(255)),
            title: z.string().max(255),
            name: z.string().max(255),
            identity: z.string().max(255),
            no_identity: z.string().max(255),
            birth_detail: z.object({
                birth_place: z.string().max(150),
                birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                    message: "Invalid date format"
                }).transform(value => new Date(value)),
            }),
            gender: z.string().max(15),
            phone: z.string().max(15),
            religion: z.string().max(25),
            language: z.string().max(50),
            maritialStatus: z.string().max(50),
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
    }).superRefine((data, ctx) => {
        if (data.payment_method === "ASURANSI" && !data.assurance_account_id) {
            ctx.addIssue({
                path: ["assurance_account_id"],
                message: "Assurance account ID is required when payment method is ASURANSI.",
            });
        }

        // Validasi tambahan untuk kasus is_newborn
        if (data.is_newborn && Array.isArray(data.patient_data)) {
            data.patient_data.forEach((patient, index) => {
                if (!patient.name) {
                    ctx.addIssue({
                        path: ["patient_data", index, "name"],
                        message: "Name is required for each newborn.",
                    });
                }
            });
        }
    })
}
