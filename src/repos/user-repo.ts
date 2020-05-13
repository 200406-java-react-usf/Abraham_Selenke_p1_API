import { User } from '../models/user';
import { CrudRepository } from './crud-repo';

import { InternalServerError } from '../errors/errors';

import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet } from '../util/result-set-mapper';
import { cursorTo } from 'readline';

export class UserRepository implements CrudRepository<User> {

    baseQuery = `
    select
        u.user_id,
        u.username,
        u.password,
        u.first_name,
        u.last_name,
        u.email,
        ur.role_name
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
}
