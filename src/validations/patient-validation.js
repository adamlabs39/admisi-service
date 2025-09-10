import {z} from "zod";

export default class PatientValidation{
    static PATIENT_VALIDATOR = z.object({
        title: z.string({ required_error: "Title perlu diisi"}).max(255),
        name: z.string({ required_error: "Nama perlu diisi"}).max(255),
        identity: z.string({ required_error: "Identitas perlu diisi"}).max(255),
        no_identity: z.string({ required_error: "No Identitas perlu diisi"}).max(255),
        birth_detail: z.object({
            birth_place: z.string({ required_error: "Tempat Lahir perlu diisi"}).max(150),
            birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                message: "Tanggal Lahir tidak sesuai format"
            }).transform(value => new Date(value)),
        }),
        gender: z.string({ required_error: "Jenis Kelamin perlu diisi"}).max(15),
        phone: z.string({ required_error: "No HP perlu diisi"}).max(15),
        religion: z.string({ required_error: "Agama perlu diisi"}).max(25),
        language: z.string({ required_error: "Bahasa perlu diisi"}).max(50),
        maritial_status: z.string({ required_error: "Status Pernikahan perlu diisi"}).max(50),
        mother_name: z.string({ required_error: "Nama Ibu Kandung perlu diisi"}).max(255),
        address: z.object({
            prov: z.string({ required_error: "Provinsi perlu diisi"}).max(150),
            city: z.string({ required_error: "Kota perlu diisi"}).max(150),
            district: z.string({ required_error: "Kecamatan perlu diisi"}).max(150),
            rt: z.string({ required_error: "RT perlu diisi"}).max(150),
            rw: z.string({ required_error: "RW perlu diisi"}).max(150),
            full_address: z.string({ required_error: "Alamat Lengkap perlu diisi"}).max(255),
            country: z.string({ required_error: "Negara perlu diisi"}).max(150),
            village: z.string({ required_error: "Desa perlu diisi"}).max(150),
            postal_code: z.string({ required_error: "Kode Pos perlu diisi"}).max(150),
        })
    });

    static PATIENT_DELETE_VALIDATOR = z.object({
        list_uuid: z.array(z.string().max(255)),
    });

    static PATIENT_UPLOAD_VALIDATOR = z.object({
        unggah_berkas: z.any().refine(file => file && file.size <= (1 * 1024 * 1024), {
            message: "Ukuran file maksimal 1MB"
        }).refine(file => file.mimetype === 'application/pdf', {
            message: "Format file tidak didukung. Silakan unggah file dengan format .pdf."
        }),
    });

    static PATIENT_IMPORT_VALIDATOR = z.object({
        title: z.string({ required_error: "Title Perlu diisi sesuai format Excel sesuai format Excel" }).max(255),
        name: z.string({ required_error: "Nama Perlu diisi sesuai format Excel" }).max(255),
        identity: z.string({ required_error: "Identitas Perlu diisi sesuai format Excel" }).max(255),
        no_identity: z.string({ required_error: "No Identitas Perlu diisi sesuai format Excel" }).max(255),
        birth_detail: z.object({
            birth_place: z.string({ required_error: "Tempat Lahir perlu diisi"}).max(150),
            birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                message: "Tanggal Lahir tidak sesuai format"
            }).transform(value => new Date(value)),
        }),
        gender: z.string({ required_error: "Jenis Kelamin Perlu diisi sesuai format Excel" }).max(15),
        phone: z.string({ required_error: "No HP Perlu diisi sesuai format Excel" }).max(15),
        religion: z.string({ required_error: "Agama Perlu diisi sesuai format Excel" }).max(25),
        language: z.string({ required_error: "Bahasa Perlu diisi sesuai format Excel"}).max(50),
        maritial_status: z.string({ required_error: "Status Pernikahan Perlu diisi sesuai format Excel" }).max(50),
        mother_name: z.string().max(255),
        address: z.object({
            prov: z.number({ required_error: "Provinsi Perlu diisi sesuai format Excel" }).max(150),
            city: z.number({ required_error: "Kota Perlu diisi sesuai format Excel" }),
            district: z.number({ required_error: "Kecamatan Perlu diisi sesuai format Excel" }),
            rt: z.string({ required_error: "RT Perlu diisi sesuai format Excel" }).max(150),
            rw: z.string({ required_error: "RW Perlu diisi sesuai format Excel" }).max(150),
            full_address: z.string({ required_error: "Alamat Lengkap Perlu diisi sesuai format Excel" }).max(255),
            country: z.string({ required_error: "Negara Perlu diisi sesuai format Excel" }).max(150),
            village: z.number({ required_error: "Desa Perlu diisi sesuai format Excel" }),
            postal_code: z.string({ required_error: "Kode Pos Perlu diisi sesuai format Excel" }).max(150),
        })
    })

    static NEWBORN_VALIDATOR = z.object({
        title: z.string({ required_error: "Title Perlu diisi" }).max(255),
        name: z.string({ required_error: "Nama Perlu diisi" }).max(255),
        identity: z.string({ required_error: "Identitas Perlu diisi" }).max(255),
        no_identity: z.string({ required_error: "No Identitas Perlu diisi" }).max(255),
        birth_detail: z.object({
            birth_place: z.string({ required_error: "Tempat Lahir perlu diisi"}).max(150),
            birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                message: "Tanggal Lahir tidak sesuai format"
            }).transform(value => new Date(value)),
        }),
        multiple_birth: z.boolean().default(false).optional(),
        birth_time: z.string().max(255).optional(),
        gender: z.string({ required_error: "Jenis Kelamin Perlu diisi" }).max(15),
        phone: z.nullable(z.string().max(15)),
        religion: z.nullable(z.string().max(25)),
        language: z.nullable(z.string().max(50)),
        mother_name: z.string({ required_error: "Nama Ibu Perlu diisi" }).max(255),
        address: z.object({
            prov: z.string({ required_error: "Provinsi Perlu diisi" }).max(150),
            city: z.string({ required_error: "Kota Perlu diisi" }).max(150),
            district: z.string({ required_error: "Kecamatan Perlu diisi" }).max(150),
            rt: z.string({ required_error: "RT Perlu diisi" }).max(150),
            rw: z.string({ required_error: "RW Perlu diisi" }).max(150),
            full_address: z.string({ required_error: "Alamat Lengkap Perlu diisi" }).max(255),
            country: z.string({ required_error: "Negara Perlu diisi" }).max(150),
            village: z.string({ required_error: "Desa Perlu diisi" }).max(150),
            postal_code: z.string({ required_error: "Kode Pos Perlu diisi" }).max(150),
        })
    })

    static WITHOUT_IDENTITY = z.object({
        name: z.string({ required_error: "Nama Perlu diisi" }).max(255),
        birth_detail: z.object({
            birth_place: z.string({ required_error: "Tempat Lahir Perlu diisi" }).max(150),
            birth_date: z.string().refine(value => !isNaN(Date.parse(value)), {
                message: "Tanggal Lahir tidak sesuai format"
            }).transform(value => new Date(value)),
        }),
        identity: z.string({ required_error: "Identitas Perlu diisi" }).max(255),
        no_identity: z.string({ required_error: "No Identitas Perlu diisi" }).max(255),
        gender: z.string({ required_error: "Jenis Kelamin Perlu diisi" }).max(15),
        phone: z.nullable(z.string().max(15)),
    });

    static CHECK_IDENTITY_VALIDATOR = z.object({
        faskes_uuid: z.string().max(255),
        no_identity: z.string().max(255),
    });

}

