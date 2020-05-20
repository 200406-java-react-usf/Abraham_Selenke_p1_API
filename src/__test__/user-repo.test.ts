import { UserRepository } from '../repos/user-repo';
import { User } from '../models/user';
import * as mockIndex from '..';
import * as mockMapper from '../util/result-set-mapper';
import { InternalServerError } from '../errors/errors';

//Mocking Connection Pool
jest.mock('..', () => {
    return {
        connectionPool: {
            connect: jest.fn()
        }
    }
});

//Mocking result set mapper
jest.mock('../util/result-set-mapper', () => {
    return {
        mapUserResultSet: jest.fn()
    }
});

describe('userRepo Testing', () => {
    let sut = new UserRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {
        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                id: 1,
                                username: 'testUser',
                                password: 'password',
                                firstName: 'Test',
                                lastName: 'Tester',
                                email: 'test8@email.com',  
                                roles: 'Admin'
                            }
                        ]
                    }
                }),
                release: jest.fn()
            }
        });
        (mockMapper.mapUserResultSet as jest.Mock).mockClear(); 
    });

    test('Return the array of Users when getAll is called', async () => {
        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 'role');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getAll();

        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(1);
        expect(mockConnect).toBeCalledTimes(1);
    })


    test('should resolve to an empty array when getAll retrieves no records from data source', async () => {

        expect.hasAssertions();
        (mockConnect as jest.Mock).mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => { return { rows: [] } }), 
                release: jest.fn()
            }
        });

        let result = await sut.getAll();
        expect(result).toBeTruthy();
        expect(result instanceof Array).toBe(true);
        expect(result.length).toBe(0);
        expect(mockConnect).toBeCalledTimes(1);

    });

    test('should resolve to a User object when getById retrieves a record from data source', async () => {

        expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 'Admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getById(1);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should throw InternalServerError when getAll is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { throw new Error(); }),
				release: jest.fn()
			};
		});

		try {
			await sut.getAll();
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
	});

    test('should throw InternalServerError when getById is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, 'test', 'password', 'Test', 'TestLast', 'email', 'Admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.getById(mockUser.id);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });    

    test('should return a newUser when save works', async () => {

		expect.hasAssertions();
        let mockUser = new User(1, 'test', 'password', 'Test', 'TestLast', 'email', 'Admin');
        
		let result = await sut.save(mockUser);

		expect(result).toBeTruthy();
    });

    test('should throw InternalServerError when save is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, 'test', 'password', 'Test', 'TestLast', 'email', 'admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.save(mockUser);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
	});
    
    test('should return void when deleteById works', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, 'test', 'password', 'Test', 'TestLast', 'email', 'Admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return; }),
				release: jest.fn()
			};
		});

		let result = await sut.deleteById(1);

		expect(result).toBeTruthy();

    });

    test('should throw InternalServerError when delete is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { throw new Error(); }),
				release: jest.fn()
			};
		});

		try {
			await sut.deleteById(1);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
	});
    
    test('should throw InternalServerError when update is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, 'test', 'password', 'Test', 'TestLast', 'email', 'Admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.update(mockUser);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });
    
    test('should return user when update works', async () => {

		expect.hasAssertions();

        let mockUser = new User(1, 'un', 'pw', 'fn', 'ln', 'email', 'Admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.update(mockUser);

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

	test('should return a user when getUserByCredentials is given a valid email', async() => {

        expect.hasAssertions();

        let mockUser = new User(3, 'un', 'pw', 'fn', 'ln', 'email', 'Admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getUserByCredentials(mockUser.username, mockUser.password);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);
    });
    
    test('should throw InternalServerError when getUserByCredentials is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, ' ', 'password', 'Test', 'TestLast', 'email', 'Admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.getUserByCredentials(mockUser.username, mockUser.password);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });
	
	test('should return a user when getByUniqueKey is given valid key and value', async() => {

        expect.hasAssertions();

        let mockUser = new User(3, 'un', 'pw', 'fn', 'ln', 'email', 'Admin');
        (mockMapper.mapUserResultSet as jest.Mock).mockReturnValue(mockUser);

        let result = await sut.getUserByUniqueKey('username', mockUser.username);

        expect(result).toBeTruthy();
        expect(result instanceof User).toBe(true);

    });

    test('should throw InternalServerError when getByUniqueKey is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockUser = new User(1, ' ', 'password', 'Test', 'TestLast', 'email', 'Admin');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.getUserByUniqueKey('username', mockUser.username);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });

});