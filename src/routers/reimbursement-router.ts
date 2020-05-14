import express from 'express';
import AppConfig from '../config/app';

export const ReimbursementRouter = express.Router();

const reimbursementService = AppConfig.reimbursementService;

ReimbursementRouter.get('/', async (req, resp) => {
    
    try{
        let payload = await reimbursementService.getAllReimbursements()
        return resp.status(200).json(payload)
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbursementRouter.get('/:id', async (req, resp) => {
    
    const id = +req.params.id;

    try{
        let payload = await reimbursementService.getReimbursementById(id)
        return resp.status(200).json(payload)
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbursementRouter.post('', async (req, resp) => {
    
    try {
        let newReimbursement = await reimbursementService.addNewReimbursement(req.body);
        return resp.status(201).json(newReimbursement);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbursementRouter.put('', async (req, resp) => {

    try {
        let updatedReimbursement = await reimbursementService.updateReimbursement(req.body);
        return resp.status(201).json(updatedReimbursement);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbursementRouter.delete('', async (req, resp) => {

    try {
        let deleteReimbursement = await reimbursementService.deleteById(req.body);
        return resp.status(202).json(deleteReimbursement);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});