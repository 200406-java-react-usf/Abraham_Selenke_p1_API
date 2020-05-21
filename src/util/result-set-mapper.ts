import { UserSchema, ReimbursementSchema } from './schemas';
import { User } from '../models/user';
import { Reimbursements } from '../models/reimbursements';

export function mapUserResultSet(resultSet: UserSchema): User {
    if(!resultSet) {
        return {} as User;
    }

    return new User(
        resultSet.user_id,
        resultSet.username,
        resultSet.password,
        resultSet.first_name,
        resultSet.last_name,
        resultSet.email,
        resultSet.roles
    );
}

export function mapReimbursementResultSet(resultSet: ReimbursementSchema): Reimbursements {
    if (!resultSet) {
        return {} as Reimbursements;
    }

    return new Reimbursements(
        resultSet.reimb_id,
        resultSet.amount,
        resultSet.submitted,
        resultSet.resolved,
        resultSet.description,
        resultSet.author_id,
        resultSet.resolver_id,
        resultSet.reimb_status,
        resultSet.reimb_type
    );
}