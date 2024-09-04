import {z} from 'zod';

export default class RawatInapValidation {
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
            birth_time: z.string().max(255).nullable(),
            gender: z.string().max(15),
            phone: z.string().max(15).nullable(),
            religion: z.string().max(25).nullable(),
            language: z.string().max(50).nullable(),
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
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string().max(255),
        multiple_birth: z.boolean().default(false),
        assurance_account_id: z.string().max(255).optional()
    });



    static UPDATE = z.object({
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
            birth_time: z.string().max(255).nullable(),
            gender: z.string().max(15),
            phone: z.string().max(15).nullable(),
            religion: z.string().max(25).nullable(),
            language: z.string().max(50).nullable(),
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
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string().max(255),
        multiple_birth: z.boolean().default(false),
        assurance_account_id: z.string().max(255).optional()
    });
}