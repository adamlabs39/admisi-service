import ProductService from "../services/product-service.js";

export default class ProductController {
  static async findByuuid(request, response, nextFunction) {
    try {
      const result = await ProductService.findByUuid(request.params.uuid);
      response.status(200).json(result)
    } catch (error) {
      nextFunction(error);
    }
  }
}
