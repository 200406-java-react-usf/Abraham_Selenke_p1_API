import { Reimbursements } from "../models/reimbursements";
import { ReimbursementRepository } from "../repos/reimbursement-repo";
import { ResourceNotFoundError, BadRequestError } from "../errors/errors";
import { isValidString, isPropertyOf, isValidId, isEmptyObject } from "../util/validator";

export class ReimbursementService {

    constructor(private  reimbursementRepo: ReimbursementRepository) {
        this.reimbursementRepo = reimbursementRepo;
    }

    async getAllReimbursements(): Promise<Reimbursements[]> {

        let reimbursements = await this.reimbursementRepo.getAll();

        if(reimbursements.length == 0) {
            throw new ResourceNotFoundError();
        }

        return reimbursements;
    }

    async getReimbursementById(id: number): Promise<Reimbursements> {

        if (!isValidId(id)) {
            throw new BadRequestError();
        }

        let reimbursement = await this.reimbursementRepo.getById(id);

        if(isEmptyObject(reimbursement)) {
            throw new ResourceNotFoundError();
        }

        return reimbursement;
    }

    async addNewReimbursement(newReimbursement: Reimbursements): Promise<Reimbursements> {
        try{
            
            if(!isValidString(newReimbursement.type)) {
                throw new BadRequestError('Invalid property value in reimbursement type.')
            }

            const reimbursementCreated = await this.reimbursementRepo.save(newReimbursement);

            return reimbursementCreated;
        } catch (e) {
            throw e
        }
    }

    async updateReimbursement(updateReimbursement: Reimbursements): Promise<boolean> {

        try {
            if(!isValidString(updateReimbursement.type)) {
                throw new BadRequestError()
            }

            return await this.reimbursementRepo.update(updateReimbursement);
        } catch (e) {
            throw e;
        }
    }

    async deleteById(id: Object): Promise<boolean> {
        
        try { 
            let keys = Object.keys(id);
            
            if(!keys.every(key => isPropertyOf(key, Reimbursements))) {
                throw new BadRequestError();
            }
            
            let key = keys[0];
		    let reimbId = +id[key];
            
		    if (!isValidId(reimbId)) {
                throw new BadRequestError();
            }

            return await this.reimbursementRepo.deleteById(reimbId);
            
        } catch (e) {
            throw e;
        }

    }
}