import sequelizeInstace from "../configurations/sequelize-instance.js";
import {Context} from "../middlewares/context.js";
import {CTX_AUTHOR} from "../constant/context-constant.js";
import PatientFamilyRepository from "./patient-family-repository.js";
import {
    GeneralConsentModel,
    PatientFamilyModel
} from "@adameds/model-sdk/admisi";
import NotfoundException from "../exception/notfound-exception.js";
import moment from "moment";

export default class GeneralConsentRepository {
    static async create(uuid, data) {
        try {
            return sequelizeInstace.transaction(async (t) => {
                const {faskesUuid} = Context.get(CTX_AUTHOR);

                if (!data.familyData) {
                throw new NotfoundException("Data keluarga pasien tidak ditemukan");
                }

                console.log("Data Family: ", data.familyData);
                if (data.familyData) {
                    const familyData = await PatientFamilyRepository.create({
                        ...data.familyData,
                        patientUuid: uuid
                    }, t);

                    data.patientFamiliesUuid = familyData.dataValues.uuid;
                }


                return GeneralConsentModel.create({
                    ...data,
                    patientUuid: uuid,
                    status: true,
                    faskesUuid
                }, {transaction: t});
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static getAllByPatient(uuid) {
        return GeneralConsentModel.findAll({
            include: [
                {
                    model: PatientFamilyModel,
                    as: "patient_family",
                    attributes: ["uuid", "name", "gender", "relationship"],
                },
            ],
            attributes: [
                "uuid","name", "created_at", "updated_at"
            ],
            where: {
                patientUuid: uuid,
                status: true,
                deletedAt: null
            },
        });
    }

    static getDetail(uuid) {
        return GeneralConsentModel.findOne({
            include: [
                {
                    model: PatientFamilyModel,
                    as: "patient_family",
                    attributes: ["uuid", "name", "gender", "relationship"],
                }
            ],
            attributes: [
                "uuid","name", "general_consent","created_at", "updated_at"
            ],
            where: {
                uuid,
                status: true,
                deletedAt: null
            },
        });
    }

    static async delete(uuid) {;
        const gc = await GeneralConsentModel.findOne({
            where: {
                uuid,
                status: true,
                deletedAt: null
            },
        });
        if (!gc) throw new NotfoundException("Data tidak ditemukan");
        return await gc.update({
            status: false,
            deletedAt: moment().unix()
        });
    }
}