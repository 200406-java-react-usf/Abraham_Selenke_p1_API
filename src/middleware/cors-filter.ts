import { Request, Response } from "express";

export function corsFilter(req: Request, resp: Response, next) {

    resp.header('Access-Control-Allow-Origin', 'http://AselenkeProject1Api-env.eba-cdvh8tyx.us-east-2.elasticbeanstalk.com');
    //resp.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    resp.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    resp.header('Access-Control-Allow-Credentials', 'true');
    resp.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    //If this requestis an OPTION request (aka "pre-flight request") send it back with a status of 200
    if (req.method === "OPTIONS") {
        resp.sendStatus(200);
    } else {
        //Passes the req and resp objects to the next piece of middleware (or Router)
        next();
    }
}