import { User } from "../models/user";
import { UserRepository } from "../repos/user-repo";
import { isEmptyObject, isPropertyOf, isValidId, isValidString, isValidObject} from "../util/validator"
import { ResourceNotFoundError, BadRequestError, AuthenticationError, ResourcePersistenceError } from "../errors/errors"

export class UserService {

    constructor(private userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    async getAllUsers(): Promise<User[]> {
        
            let users = await this.userRepo.getAll();

            if(users.length == 0){
                throw new ResourceNotFoundError();
            }

            return users.map(this.removePassword);
    }

    async getUserById(id: number): Promise<User> {
        
        if (!isValidId(id)) {
            throw new BadRequestError();
        }

        let user = await this.userRepo.getById(id);

        if(isEmptyObject(user)) {
            throw new ResourceNotFoundError();
        }

        return this.removePassword(user);
    }

    async getUserByUniqueKey(queryObj: any): Promise<User> {

        try {

            let queryKeys = Object.keys(queryObj);
            if(!queryKeys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }

            let key = queryKeys[0];
            let val = queryKeys[key];
            if (key === 'id') {
                return await this.getUserById(+val);
            }

            if(!isValidString(val)){
                throw new BadRequestError();
            }
            let user = await this.userRepo.getUserByUniqueKey(key, val);

            if (isEmptyObject(user)) {
                throw new ResourceNotFoundError();
            }

            return this.removePassword(user);

        } catch (e) {
            throw e;
        }
    }

    async authenticateUser(un: string, pw: string): Promise<User> {

        try {
            if (!isValidString(un, pw)) {
                throw new BadRequestError();
            }

            let authUser: User;
            
            authUser = await this.userRepo.getUserByCredentials(un, pw);          

            if (isEmptyObject(authUser)) {
                throw new AuthenticationError('Bad credentials provided.');
            }

            return this.removePassword(authUser);

        } catch (e) {
            throw e;
        }

    }

    async addNewUser(newUser: User): Promise<User> {
        
        try {

            if (!isValidObject(newUser, 'id')) {
                throw new BadRequestError('Invalid property values found in provided user.');
            }

            let usernameAvailable = await this.isUsernameAvailable(newUser.username);
            if (!usernameAvailable) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }
        
            let emailAvailable = await this.isEmailAvailable(newUser.email);
            if (!emailAvailable) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }

            newUser.role = 'user';
            const persistedUser = await this.userRepo.save(newUser);

            return this.removePassword(persistedUser);

        } catch (e) {
            throw e
        }

    }

    async updateUser(updatedUser: User): Promise<boolean> {
        
        try {
            if (!isValidObject(updatedUser)) {
                throw new BadRequestError('Invalid user provided (invalid values found).');
            }

            let usernameAvailable = await this.isUsernameAvailable(updatedUser.username);
            if (!usernameAvailable) {
                throw new ResourcePersistenceError('The provided username is already taken.');
            }
        
            let emailAvailable = await this.isEmailAvailable(updatedUser.email);
            if (!emailAvailable) {
                throw new  ResourcePersistenceError('The provided email is already taken.');
            }
            
            return await this.userRepo.update(updatedUser);

        } catch (e) {
            throw e;
        }

    }

    async deleteById(id: number): Promise<boolean> {
        
        try {
            let keys = Object.keys(id);
            
            if(!keys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }
            
            let key = keys[0];
		    let userId = +id[key];
        

            if(!keys.every(key => isPropertyOf(key, User))) {
                throw new BadRequestError();
            }
            
		    if (!isValidId(userId)) {
                throw new BadRequestError();
            }

            return await this.userRepo.deleteById(userId);
            
        } catch (e) {
            throw e;
        }

    }

    async isUsernameAvailable(username: string): Promise<boolean> {

        try {
            await this.getUserByUniqueKey({'username': username});
        } catch (e) {
            return true;
        }
        return false;

    }

    async isEmailAvailable(email: string): Promise<boolean> {
        
        try {
            await this.getUserByUniqueKey({'email': email});
        } catch (e) {
            return true;
        }
        return false;
    }

    private removePassword(user: User): User {
        if(!user || !user.password) return user;
        let usr = {...user};
        delete usr.password;
        return usr;
    }
}
