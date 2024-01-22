import { NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction,Request,Response } from "express";

export class ClientMiddleware implements NestMiddleware {
    use(req : Request,res:Response,next: NextFunction){
        const CLIENT_API_KEY = process.env.CLIENT_API_KEY || null
        if(!CLIENT_API_KEY){
            return res.status(500).json({error : "server error, try later"})
        }
        console.log("headers:",req.headers["api-key"])
        if(req.headers["api-key"] && req.headers["api-key"] == process.env.CLIENT_API_KEY){
            return next()
        }else{
            throw new UnauthorizedException("auth not found or invalid",{description:"your application does not have the required authorization"})
        }
    }
}