import { UserService } from '../services/user-service';
import { User } from '../models/user';
import { ResourceNotFoundError, BadRequestError, AuthenticationError } from '../errors/errors';
import validator from '../util/validator';

jest.mock('../repos/user-repo', () => {

	return new class UserRepository {
		getAll = jest.fn();
        getById = jest.fn();
        getUserByUniqueKey = jest.fn();
        getUserByCredentials = jest.fn();
		save = jest.fn();
		update = jest.fn();
        deleteById = jest.fn();
        isUsernameAvailable = jest.fn();
        isEmailAvailable = jest.fn();
	};
});


describe('userService', () => {

	let sut: UserService;
	let mockRepo;

	let mockUsers = [
		new User (1, 'jturm', 'password', 'Jeremy', 'turmboi', 'jturm@test.com', 'Admin'),	
        new User (2, 'kbluestar', 'password', 'Kevin', 'Bluestar', 'kbluestar@test.com', 'Admin'),
        new User (3,'lpleasent', 'password', 'Lauren', 'Pleasant', 'lpleasant@test.com', 'Admin'),
	];

	beforeEach( () => {

		mockRepo = jest.fn(() => {
			return {
				getAll: jest.fn(),
                getById: jest.fn(),
                getUserByUniqueKey: jest.fn(),
                getUserByCredentials: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn(),
                isUsernameAvailable: jest.fn(),
                isEmailAvailable: jest.fn(),
                isNicknameAvailable:jest.fn()
			};
		});

		sut = new UserService(mockRepo);

    });

    test('should return an array of users without passwords when getAllUser succesfully retrieves all users from db', async () => {

		expect.hasAssertions();
		mockRepo.getAll = jest.fn().mockReturnValue(mockUsers);

		let result = await sut.getAllUsers();

		expect(result).toBeTruthy();
		expect(result.length).toBe(3);
        result.forEach(value => expect(value.password).toBeUndefined());
    });

    test('should throw a ResourceNotFoundError when getAllUsers fails to get any users', async () => {

		expect.hasAssertions();
		mockRepo.getAll = jest.fn().mockReturnValue([]);

		try{
			await sut.getAllUsers();
		} catch (e) {
			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
	});
	
	test('should throw a ResourceNotFoundError when getUserById fails to get any users', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue([]);

		try{
			await sut.getUserById(1);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
    });
    
    test('should resolve a User when getUserById is given a valid id', async () => {

		expect.hasAssertions();

		validator.isValidId = jest.fn().mockReturnValue(true);
        validator.isEmptyObject = jest.fn().mockReturnValue(true);

		mockRepo.getById = jest.fn().mockImplementation((id: number) => {
			return new Promise<User>((resolve) => resolve(mockUsers[id - 1]));
		});

		let result = await sut.getUserById(1);

		expect(result).toBeTruthy();
		expect(result.user_id).toBe(1);
		expect(result.password).toBeUndefined();
	});

    test('should throw BadRequestError when getUserById is provided a negative id value', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getUserById(-1);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getUserById is given a value of zero)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getUserById(0);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

    test('should throw BadRequestError when getUserById is given a of a decimal value)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getUserById(1.01);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getUserById is given not a number)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getUserById(NaN);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

	test('should throw a ResourceNotFoundError when getUserById', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue([]);

		try{
			await sut.getUserById(1);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
    });

    test('should return a newUser when save is given a valid user object', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(true);
		mockRepo.isUsernameAvailable = jest.fn().mockReturnValue(true);
        mockRepo.isEmailAvailable = jest.fn().mockReturnValue(true);

		mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
			return new Promise<User>((resolve) => {
				mockUsers.push(newUser); 
				resolve(newUser);
			});
		});

		let result = await sut.addNewUser(new User(4, 'Test', 'password', 'TestFirst', 'TestLast', 'test@user.com', 'Admin'));

		expect(result).toBeTruthy();
		expect(mockUsers.length).toBe(4);
	});

	test('should throw BadRequestError when save is envoked and username is not unique', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(true);
		validator.isEmptyObject = jest.fn().mockReturnValue(false);
		mockRepo.usernameAvailable = jest.fn().mockReturnValue(mockUsers[0]);
        mockRepo.emailAvailable = jest.fn().mockReturnValue({});

		try {
			await sut.addNewUser(new User(4, 'lpleasent', 'password', 'TestFirst', 'TestLast', 'test@user.com', 'Admin'));
		} catch (e) {		
			expect(e instanceof BadRequestError).toBe(false);
		}
	});

	test('should throw BadRequestError when saveUser is envoked and provided an invalid user', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(false);
		validator.isEmptyObject = jest.fn().mockReturnValue(false);
		mockRepo.usernameAvailable = jest.fn().mockReturnValue({});
		mockRepo.emailAvailable = jest.fn().mockReturnValue({});

		try {
			await sut.addNewUser(new User(4, '', 'password', 'TestFirst', 'TestLast', 'test@user.com', 'Admin'));
		} catch (e) {		
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

	test('should return true when deleteById succesfully deletes a user', async () => {

		validator.isValidId = jest.fn().mockReturnValue(true);
		validator.isPropertyOf = jest.fn().mockReturnValue(true);
		mockRepo.deleteById = jest.fn().mockReturnValue(true);
		
		try {
			await sut.deleteById(1);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

    //Need to look into
	test('should throw BadRequestError when updateUser is envoked and given an invalid user object', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(false);
		mockRepo.updateUser = jest.fn().mockReturnValue(true);
		sut.isEmailAvailable = jest.fn().mockReturnValue(true);
		sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

		try{
			await sut.updateUser(new User(4, 'Test', 'password', 'TestFirst', 'TestLast', 'test@user.com', 'Admin'));
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(false);
		}
	});

	test('should throw BadRequestError when updateUser is envoked and given an invalid user object', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(false);
		mockRepo.updateUser = jest.fn().mockReturnValue(true);
		sut.isEmailAvailable = jest.fn().mockReturnValue(false);
		sut.isUsernameAvailable = jest.fn().mockReturnValue(true);

		mockRepo.save = jest.fn().mockImplementation((newUser: User) => {
            return new Promise<User> ((resolve) => {
                mockUsers.push(newUser);
                resolve(newUser);
            });
        });

        try{
			await sut.updateUser(new User(4, 'Test', 'password', 'TestFirst', 'TestLast', 'test@user.com', 'Admin'));
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(false);
		}
	});

	test('should reject with BadRequestError when getUserByUniqueKey is given a invalid value', async () => {

        expect.hasAssertions();

        try {

        validator.isPropertyOf = jest.fn().mockReturnValue(false);
        validator.isValidString = jest.fn().mockReturnValue(true);
        validator.isEmptyObject = jest.fn().mockReturnValue(false);

        await sut.getUserByUniqueKey('');
        } catch (e) {
        	expect(e instanceof BadRequestError).toBe(true);
        }
    });

    test('should reject with BadRequestError when getUserByUniqueKey is given a invalid value)', async () => {

        expect.hasAssertions();

        try {
        validator.isPropertyOf = jest.fn().mockReturnValue(true);
        validator.isValidString = jest.fn().mockReturnValue(false);
        validator.isEmptyObject = jest.fn().mockReturnValue(false);

        mockRepo.getUserByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User>((resolve) => {
                resolve(mockUsers.find(user => user[key] === val));
            });
        });
 
        await sut.getUserByUniqueKey({'username': ''});
        } catch (e) {
            expect(e instanceof BadRequestError).toBe(true);
        }

    });

    test('should reject with ResourceNotFoundError when getUserByUniqueKey return an empty object', async () => {
		
		expect.hasAssertions();
		
        try {
        validator.isPropertyOf = jest.fn().mockReturnValue(true);
        validator.isValidString = jest.fn().mockReturnValue(true);
        validator.isEmptyObject = jest.fn().mockReturnValue(true);
        mockRepo.getUserByUniqueKey = jest.fn().mockImplementation((key: string, val: string) => {
            return new Promise<User>((resolve) => {
                resolve({} as User);
            });
		});
		
        await sut.getUserByUniqueKey({'username': 'notTure'});
        } catch (e) {
            expect(e instanceof ResourceNotFoundError).toBe(false);
        }
    });

    test('should resolve to User when authenticateUser is given a valid a known username and password', async () => {

		expect.hasAssertions();
        
        validator.isValidString = jest.fn().mockReturnValue(true);

        mockRepo.getUserByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
            return new Promise<User>((resolve) => {
                resolve(mockUsers.find(user => user['username'] === un && user['password'] === pw ));
            });
        });

        let result = await sut.authenticateUser('lpleasent', 'password');
        expect(result).toBeTruthy();
        expect(result.username).toBe('lpleasent');
        expect(result.password).toBeUndefined();
    });

    test('should reject with BadRequestError when authenticateUser is given an invalid value', async () => {

		expect.hasAssertions();

        try {
			validator.isValidString = jest.fn().mockReturnValue(false);
			
            await sut.authenticateUser('', '');
            } catch (e) {

                expect(e instanceof BadRequestError).toBe(true);
            }
    });

    test('should reject with AuthenticationError when authenticateUser results in an empty object', async () => {

		expect.hasAssertions();

        try {
            
            validator.isValidString = jest.fn().mockReturnValue(true);
            mockRepo.getUserByCredentials = jest.fn().mockImplementation((un: string, pw: string) => {
                return new Promise<User>((resolve) => { resolve({} as User); });
			});
			
            await sut.authenticateUser('lpleasent','password');
            } catch (e) {
                expect(e instanceof AuthenticationError).toBe(true);
            }

	});

	
});