import {z} from "zod";

export default class GeneralConsentValidation{
    static CREATE = z.object({
        family_data: z.union([
            z.object({
                name: z.string({ required_error: "Nama perlu diisi" }).max(255),
                gender: z.string({ required_error: "Jenis Kelamin perlu diisi" }).max(15),
                relationship: z.string({ required_error: "Relationship perlu diisi" }).max(150),
                address: z.string({ required_error: "Alamat perlu diisi" }).max(255).optional(),
            }),
            z.null(),
        ]).optional(),
        name: z.string().max(255),
        general_consent: z.string(),
    });
}