import { Reimbursements } from '../models/reimbursements';
import { CrudRepository } from './crud-repo';

import { InternalServerError } from '../errors/errors';

import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapReimbursementResultSet } from '../util/result-set-mapper';

export class ReimbursementRepository implements CrudRepository<Reimbursements> {

    baseQuery = `
    select
        r.reimb_id ,
        r.amount,
        r.submitted,
        r.resolved, 
        r.description,
        u.first_name,
        r.resolver_id,
        rs.reimb_status, 
        rt.reimb_type
    from reimbursements r
    left join reimbursement_types rt
    on rt.reimb_type_id = r.reimb_type_id
    left join reimbursement_statuses rs
    on rs.reimb_status_id = r.reimb_status_id
    left join users u
    on u.user_role_id = r.author_id
    left join users 
    on u.user_role_id = r.resolver_id
    `;

    async getAll(): Promise<Reimbursements[]> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
            return rs.rows.map(mapReimbursementResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async getById(id: number): Promise<Reimbursements> {
        
        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where r.reimb_id = $1`;
            let rs = await client.query(sql, [id]);
            return mapReimbursementResultSet(rs.rows[0]);
        } catch (e) {
               throw new InternalServerError();  
        } finally {
               client && client.release();
        } 
    }

    async save(newReimbursement: Reimbursements): Promise<Reimbursements> {
            
        let client: PoolClient;

        try {

            client = await connectionPool.connect();
            let sql = `
            insert into reimbursements (amount, submitted, description, first_name, reimb_type)
            values ($1, $2, $3, $4, $5) 
            returning id`;
            let rs = await client.query(sql, [newReimbursement.amount, newReimbursement.submitted, newReimbursement.description, newReimbursement.type]);
            newReimbursement.reimbId = rs.rows[0].id;
            return newReimbursement;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async update(updatedReimbursement: Reimbursements): Promise<boolean> {
        
        let client: PoolClient;
        try {
            client = await connectionPool.connect();

            let sql = `
            update reimbursements
            set amount = $2, description = $3, reimb_type = $4
            where id = $1`;
            let rs = await client.query(sql, [updatedReimbursement.amount, updatedReimbursement.description, updatedReimbursement.type]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }


    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `
            delete from reimbursements
            where id = $1`;
            let rs = await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }
}