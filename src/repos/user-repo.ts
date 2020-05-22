import { User } from '../models/user';
import { CrudRepository } from './crud-repo';

import { InternalServerError } from '../errors/errors';

import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet } from '../util/result-set-mapper';

export class UserRepository implements CrudRepository<User> {

    baseQuery = `
    select
        u.user_id,
        u.username,
        u.password,
        u.first_name,
        u.last_name,
        u.email,
        ur.roles
    from users u
    join user_roles ur
    on u.user_role_id = ur.role_id
    `;

    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
            return rs.rows.map(mapUserResultSet);
        } catch (e) {            
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async getById(id: number): Promise<User> {
        
        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where u.user_id = $1`;
            let rs = await client.query(sql, [id]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {            
            throw new InternalServerError();  
        } finally {
               client && client.release();
        } 
    }

    async getUserByUniqueKey(key: string, val: string): Promise<User> {

        let client: PoolClient;

        try{
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where u.${key} = $1`;
            let rs = await client.query(sql, [val]);
            return mapUserResultSet(rs.rows[0]);
           } catch (e) {               
               throw new InternalServerError();  
           } finally {
               client && client.release();
           } 
    }

    async getUserByCredentials(un: string, pw: string) {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where u.username = $1 and u.password = $2`;
            let rs = await client.query(sql, [un, pw]);            
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async save(newUser: User): Promise<User> {
            
        let client: PoolClient;

        try {

            client = await connectionPool.connect();
            let sql = `
            insert into users (username, password, first_name, last_name, email)
            values ($1, $2, $3, $4, $5) 
            returning user_id
            `;
            let rs = await client.query(sql, [newUser.username, newUser.password, newUser.firstName, newUser.lastName, newUser.email]);            
            newUser.user_id = rs.rows[0].id;
            return newUser;

        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async update(updatedUser: User): Promise<boolean> {
        
        let client: PoolClient;
        try {
            client = await connectionPool.connect();
            let roleId = (await client.query('select role_id from user_roles where roles = $1;', [updatedUser.roles])).rows[0].role_id;
            
            let sql = `
            update users
            set username = $2, password = $3, first_name = $4, last_name = $5, email = $6, user_role_id = $7
            where user_id = $1`;
            let rs = await client.query(sql, [updatedUser.user_id, updatedUser.username, updatedUser.password, updatedUser.firstName, updatedUser.lastName, updatedUser.email, roleId]);
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
            delete from users
            where user_id = $1`;
            let rs = await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

}
