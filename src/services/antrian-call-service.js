import AntrianCallRepository from "../repositories/antrian-call-repository.js";

export default class AntrianCallService {
    static async getAllAntrian(){
        return await AntrianCallRepository.getAllAntrian();
    }
}