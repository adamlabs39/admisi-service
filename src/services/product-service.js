import PorductRepository from "../repositories/product-repository.js";

export default class ProductService {
  static async findByUuid(uuid) {
    return await PorductRepository.findByUuid(uuid);
  }
}
