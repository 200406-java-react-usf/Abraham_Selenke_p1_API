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
        r.author_id,
        r.resolver_id,
        rs.reimb_status, 
        rt.reimb_type
    from reimbursements r
    left join reimbursement_types rt
    on rt.reimb_type_id = r.reimb_type_id
    left join reimbursement_statuses rs
    on rs.reimb_status_id = r.reimb_status_id
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
            let reimbStatus = (await client.query(`select rs.reimb_status_id from reimbursement_statuses rs where rs.reimb_status = $1`, [newReimbursement.reimb_status])).rows[0].reimb_status_id;
            let reimbType = (await client.query(`select rt.reimb_type_id from reimbursement_types rt where rt.reimb_type = $1`, [newReimbursement.reimb_type])).rows[0].reimb_type_id;

            let sql = `
            insert into reimbursements (amount, description, author_id, reimb_status_id, reimb_type_id)
            values ($1, $2, $3, $4, $5) 
            returning reimb_id`;
            let rs = await client.query(sql, [newReimbursement.amount, newReimbursement.description, newReimbursement.author_id, reimbStatus, reimbType]);
            newReimbursement.reimb_id = rs.rows[0].id;
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
            let reimbType = (await client.query(`select rt.reimb_type_id from reimbursement_types rt where rt.reimb_type = $1`, [updatedReimbursement.reimb_type])).rows[0].reimb_type_id;
            let sql = `
            update reimbursements
            set amount = $2, description = $3, reimb_type_id = $4
            where reimb_id = $1`;
            let rs = await client.query(sql, [updatedReimbursement.reimb_id, updatedReimbursement.amount, updatedReimbursement.description, reimbType]);
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
            where reimb_id = $1`;
            let rs = await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

    async getByAuthor(id: number): Promise<Reimbursements[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `
            select r.reimb_id, u.first_name, r.amount, r.submitted, r.description, rt.reimb_type, rs.reimb_status, r.resolved, r.resolver_id   
            from reimbursements r
            join reimbursement_statuses rs
            on rs.reimb_status_id = r.reimb_status_id
            join reimbursement_types rt
            on rt.reimb_type_id  = r.reimb_type_id
            join users u
            on u.user_id = r.author_id 
            where author_id = $1
            `;
            let rs = await client.query(sql, [id]);
            return rs.rows;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }
}