import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { isEmptyObject } from '../util/validator'
import { ParsedUrlQuery } from 'querystring';
import { adminGuard } from '../middleware/auth-middleware';
import { managerGuard } from '../middleware/manager-middleware';
import { empGuard } from '../middleware/emp-middleware';


export const UserRouter = express.Router();

const userService = AppConfig.userService;

UserRouter.get('', adminGuard, async (req, resp) => {
    try{
        
        let reqURL = url.parse(req.url, true);

        if(!isEmptyObject<ParsedUrlQuery> (reqURL.query)) {
            let payload = await userService.getUserByUniqueKey({...reqURL.query});
            resp.status(200).json(payload);
        } else {
            let payload = await userService.getAllUsers();
            resp.status(200).json(payload)
        }
    } catch (e) {        
        resp.status(e.statusCode).json(e)
    }
});

UserRouter.get('/:id', async (req, resp) => {
    
    const id = +req.params.id;

    try{
        let payload = await userService.getUserById(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

UserRouter.post('', adminGuard, async (req, resp) => {

    try {
        let newUser = await userService.addNewUser(req.body);
        return resp.status(201).json(newUser);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

UserRouter.put('', adminGuard, async (req, resp) => {
        
    try {
        let updateUser = await userService.updateUser(req.body);
        return resp.status(201).json(updateUser);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

UserRouter.delete('', adminGuard, async (req, resp) => {

    try {
        let deleteUser = await userService.deleteById(req.body);
        return resp.status(202).json(deleteUser);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});
