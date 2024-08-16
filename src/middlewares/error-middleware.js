import NotfoundException from "../exception/notfound-exception.js";
import UnauthorizedException from "../exception/unauthorized-exception.js";
import errorResponse from "../responses/error-response.js";
import BadRequestException from "../exception/bad-request-exception.js";
import DuplicateException from "../exception/duplicate-exception.js";
import {UniqueConstraintError} from "sequelize";
import {ZodError} from "zod";
import zodErrorParser from "../helper/zod-error-parser.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  console.error("Error Middleware", error);
  if (error instanceof NotfoundException) {
    return response.status(error.code).json(errorResponse(error.message));
  }else if(error instanceof UnauthorizedException){
    return response.status(error.code).json(errorResponse(error.message));
  }
  else if(error instanceof BadRequestException){
    response.status(error.status).json({message: error.message});
  }
  else if(error instanceof DuplicateException){
    response.status(error.code).json({messages: error.message});
  }
  else if(error instanceof UniqueConstraintError){
    response.status(400).json({message: error.errors[0].message})
  }
  else if( error instanceof ZodError){
    response.status(400).json({message: zodErrorParser(error.errors)});
  }else{
    response.status(500).json(errorResponse(error.message))
  }
};

export default errorMiddleware;