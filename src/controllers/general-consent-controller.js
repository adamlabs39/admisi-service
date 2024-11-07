import GeneralConsentService from "../services/general-consent-service.js";
import successResponse from "../responses/success-response.js";

export default class GeneralConsentController{
    static async create(req, res, next){
        try{
            const result = await GeneralConsentService.create(req.params.uuid, req.body);
            return res.status(201).json(successResponse("General Consent Created"));
        }catch (error){
            next(error);
        }
    }

    static async getAll(req,res,next){
        try{
            const result = await GeneralConsentService.get(req.params.uuid);
            return res.status(200).json(successResponse("General Consent List", result));
        }catch (error){
            next(error);
        }
    }

    static async getDetail(req,res,next){
        try{
            const result = await GeneralConsentService.getDetail(req.params.uuid);
            return res.status(200).json(successResponse("General Consent Detail", result));
        }catch (error){
            next(error);
        }
    }


    static async delete(req,res,next){
        try {
            const result = await GeneralConsentService.delete(req.params.uuid);
            return res.status(200).json(successResponse("General Consent Deleted"));
        } catch (error) {
            next(error);
        }
    }
}