import {FaskesModel} from "@adameds/model-sdk/datamaster";

export default class FaskesRepository {
    static async getFaskesByUuid(uuid) {
        return await FaskesModel.findOne({
            where: {
                uuid: uuid,
            },
            attributes: [
                "id", "uuid", "code", "name", "status",
            ],
        });
    }
}