import {z} from "zod";

export default class PatientValidation{
    static PATIENT_VALIDATOR = z.object({
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
        maritial_status: z.string().max(50),
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

    static NEWBORN_VALIDATOR = z.object({
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
        multiple_birth: z.boolean().default(false).optional(),
        birth_time: z.string().max(255),
        gender: z.string().max(15),
        phone: z.nullable(z.string().max(15)),
        religion: z.nullable(z.string().max(25)),
        language: z.nullable(z.string().max(50)),
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

    static WITHOUT_IDENTITY = z.object({
        name: z.string().max(255),
        birth_detail: z.object({
            birth_place: z.string().max(150),
            birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                message: "Invalid date format"
            }).transform(value => new Date(value)),
        }),
        identity: z.string().max(255),
        no_identity: z.string().max(255),
        gender: z.string().max(15),
        phone: z.nullable(z.string().max(15)),
    });

}

