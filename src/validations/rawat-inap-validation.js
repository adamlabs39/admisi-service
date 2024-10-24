import {z} from 'zod';
import PatientValidation from "./patient-validation.js";

export default class RawatInapValidation {
    static CREATE = z.object({
        patient_data: z.object({
            ...PatientValidation.NEWBORN_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255),
        note: z.string().max(255),
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string().max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string().max(255),
        assurance_account_id: z.string().max(255).optional()
    });


    static UPDATE_NEWBORN = z.object({
        is_newborn: z.boolean().default(false).optional(),
        patient_data: z.object({
            ...PatientValidation.NEWBORN_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255),
        note: z.string().max(255),
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string().max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string().max(255),
        assurance_account_id: z.string().max(255).optional(),
    })

    static UPDATE_PATIENT = z.object({
        is_newborn: z.boolean().default(false).optional(),
        patient_data: z.object({
            ...PatientValidation.PATIENT_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255),
        note: z.string().max(255),
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string().max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string().max(255),
        assurance_account_id: z.string().max(255).optional(),
    })


    static CANCELVISIT = z.object({
        list_uuid: z.array(z.string().max(255)),
        cancel_reason: z.string().max(255)
    });
}