import PatientService from "../services/patient-service.js";
import {response} from "express";
import successResponse from "../responses/success-response.js";

export default class PatientController {
    static async create(req, res, next) {
        try {
            const patient = await PatientService.create(res.locals.jwtData, req.body);
            return res.status(201).json(successResponse(patient.message));
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const patient = await PatientService.update(req.params.uuid, res.locals.jwtData, req.body);
            return res.status(200).json(patient);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const patient = await PatientService.delete(req.params.uuid);
            return res.status(200).json(patient);
        } catch (error) {
            next(error);
        }
    }

    static async findByUuid(req, res, next) {
        try {
            const patient = await PatientService.findByUuid(req.params.uuid);
            return res.status(200).json(patient);
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req, res, next) {
        try {
            const patient = await PatientService.findAll(req.query);
            return res.status(200).json(patient);
        } catch (error) {
            next(error);
        }
    }
}