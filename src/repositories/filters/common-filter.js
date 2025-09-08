import {Op} from "sequelize";
import sequelizeInstance from "../../configurations/sequelize-instance.js";

export default function commonFilter({faskesUuid, args = {}, options = {}}) {
    const filter = {
        faskesUuid,
        [Op.or]: [
                //* Filter Nama dan Title patient
            sequelizeInstance.where(sequelizeInstance.fn("concat", sequelizeInstance.col("patient.title"), " ", sequelizeInstance.col("patient.name")), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter Alamat
            sequelizeInstance.where(sequelizeInstance.col("patient.address.full_address"), { [Op.iLike]: `%${args.q || ""}%` }),
                //* Filter No Rm Patient
            sequelizeInstance.where(sequelizeInstance.col("patient.no_rm"), { [Op.iLike]: `%${args.q || ""}%` }),
            ],
        ...options
    }

    return filter;
}