import { z } from "zod";
import PatientValidation from "./patient-validation.js";

export default class InstallasiGawatDaruratValidation {
    static IGD_VALIDATOR = z.object({
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        is_newborn: z.boolean().default(false),
        without_identity: z.boolean().default(false),
        practitioner_uuid: z.string().max(255),
        complaint: z.string().max(255),
        note: z.string().max(255),
        maternity: z.boolean().default(false),
    });

    static IGD_VALIDATOR_REGISTRATION_WITHOUT_IDENTITY = z.object({
        patient_data: z.object({
            ...PatientValidation.WITHOUT_IDENTITY.shape,
        }),
        ...InstallasiGawatDaruratValidation.IGD_VALIDATOR.shape,
    });

    static IGD_VALIDATOR_REGISTRATION = z.object({
        patient_data: z.object({
            patient_uuid: z.optional(z.string().max(255).uuid()),
            ...PatientValidation.PATIENT_VALIDATOR.shape,
        }),
        ...InstallasiGawatDaruratValidation.IGD_VALIDATOR.shape,
    });

    static IGD_VALIDATOR_NEW_BORN = z.object({
        patient_data: z.object({
            patient_uuid: z.optional(z.string().max(255).uuid()),
            ...PatientValidation.PATIENT_VALIDATOR.shape,
        }),
        ...InstallasiGawatDaruratValidation.IGD_VALIDATOR.shape,
    });

    static CANCELVISIT = z.object({
        list_uuid: z.array(z.string().max(255)),
        cancel_reason: z.string().max(255)
    });

}
