import PatientModel from "../models/patient-model.js";
import { Op } from "sequelize";
import Pagination from "../helper/pagination.js";
import sequelizeInstace from "../configurations/sequelize-instance.js";
import PatientRepository from "./patient-repository.js";
import {getInfoAge} from "../helper/utility.js";
export default class RawatJalanRepository{
    static async getAll(args){
        const filter = {
            name: {
                [Op.like]: `%${args.name || ""}%`
            },
            // TODO : Add more filter By Payment method, poli, etc
        };
        return await Pagination.do(
            PatientModel,
            args,
            filter,
        );
    }

    static async getOne(uuid){
        try{
            return await PatientModel.findOne({
                where: {
                    [Op.and]: [
                        { uuid },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                }
            })
        }catch (error){
            throw error;
        }
    }


    static async create(data){
        try{
            const result = await sequelizeInstace.transaction(async (t) => {
                const data = sequelizeInstace.transaction(async (t) => {
                    const patient = await PatientRepository.registPatient({

                    },t)
                });
            });
        }catch (error){
            throw error;
        }
    }
}