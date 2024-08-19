import {z} from "zod";

export default class PatientValidation{
    static CREATE = z.object({
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
    })


    static UPDATE = z.object({
        title: z.string().max(255),
        name: z.string().max(255),
        identity: z.string().max(255),
        no_identity: z.string().max(255),
        birth_detail: z.object({
            birth_detail_uuid: z.nullable(z.string().max(255).optional()),
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
    })
}

