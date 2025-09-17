import {z} from 'zod';
import PatientValidation from "./patient-validation.js";
import AsuransiValidator from "./asuransi-validator.js";

export default class RawatInapValidation {
    static CREATE = z.object({
        patient_data: z.object({
            ...PatientValidation.NEWBORN_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255).default(""),
        note: z.string().max(255).default(""),
        join_bill: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string({ required_error: "Bed perlu dipilih" }).max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string({ required_error: "Dokter perlu dipilih" }).max(255),
        insurance: AsuransiValidator.ASURANSI_VALIDATOR.optional(),
    }).refine((data) => {
        if (data.payment_method === "ASURANSI" && !data.insurance) {
            return false;
        }
        return true;
    }, {
        message: "Informasi asuransi diperlukan saat metode pembayaran adalah ASURANSI",
        path: ["insurance"]
    });


    static UPDATE_NEWBORN = z.object({
        is_newborn: z.boolean().default(false).optional(),
        patient_data: z.object({
            ...PatientValidation.NEWBORN_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255).default(""),
        note: z.string().max(255).default(""),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string({ required_error: "Bed perlu dipilih" }).max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string({ required_error: "Dokter perlu dipilih" }).max(255),
        insurance: AsuransiValidator.ASURANSI_VALIDATOR.optional(),
    }).refine((data) => {
        if (data.payment_method === "ASURANSI" && !data.insurance) {
            return false;
        }
        return true;
    }, {
        message: "Informasi asuransi diperlukan saat metode pembayaran adalah ASURANSI",
        path: ["insurance"],
    });

    static UPDATE_PATIENT = z.object({
        is_newborn: z.boolean().default(false).optional(),
        patient_data: z.object({
            ...PatientValidation.PATIENT_VALIDATOR.shape
        }),
        payment_method: z.enum(["TUNAI", "ASURANSI"]),
        complaint: z.string().max(255).default(""),
        note: z.string().max(255).default(""),
        maternity: z.boolean().default(false),
        upgrade_class: z.boolean().default(false),
        entrusted_patient: z.boolean().default(false),
        previous_bill: z.boolean().default(false),
        spare_bed: z.boolean().default(false),
        box_baby: z.boolean().default(false),
        family_bill: z.boolean().default(false),
        monitoring_room_uuid: z.string({ required_error: "Bed perlu dipilih" }).max(255),
        multiple_birth: z.boolean().default(false),
        practitioner_uuid: z.string({ required_error: "Dokter perlu dipilih" }).max(255),
        insurance: AsuransiValidator.ASURANSI_VALIDATOR.optional(),
    }).refine((data) => {
        if (data.payment_method === "ASURANSI" && !data.insurance) {
            return false;
        }
        return true;
    }, {
        message: "Informasi asuransi diperlukan saat metode pembayaran adalah ASURANSI",
        path: ["insurance"],
    });


    static CANCELVISIT = z.object({
        list_uuid: z.array(z.string({ required_error: "Pembatalan Rawat Inap perlu diisi" }).max(255)),
        cancel_reason: z.string({ required_error: "Alasan Pembatalan perlu diisi" }).max(255)
    });
}