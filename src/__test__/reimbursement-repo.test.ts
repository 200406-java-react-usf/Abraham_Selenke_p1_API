import { ReimbursementRepository } from '../repos/reimbursement-repo';
import { Reimbursements } from '../models/reimbursements';
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
        mapReimbursementResultSet: jest.fn()
    }
});

describe('reimbRepo Testing', () => {
    let sut = new ReimbursementRepository();
    let mockConnect = mockIndex.connectionPool.connect;

    beforeEach(() => {
        (mockConnect as jest.Mock).mockClear().mockImplementation(() => {
            return {
                query: jest.fn().mockImplementation(() => {
                    return {
                        rows: [
                            {
                                reimb_id: 1,
                                amount: 250.00,
                                submitted: new Date(),
                                resolved: new Date(),
                                description: 'Heading to USF',
                                author_id: 1,
                                resolver: 2,
                                reimb_status: 'Approved',
                                reimb_type: 'Travel'
                            }
                        ]
                    }
                }),
                release: jest.fn()
            }
        });
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockClear(); 
    });

    test('Return the array of Reimbursements when getAll is called', async () => {
        expect.hasAssertions();

        let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimbursements);

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

    test('should resolve to a Reimbursements object when getById retrieves a record from data source', async () => {

        expect.hasAssertions();

        let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimbursements);

        let result = await sut.getById(1);

        expect(result).toBeTruthy();
        expect(result instanceof Reimbursements).toBe(true);

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
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.getById(mockReimbursements.reimb_id);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });    

    test('should return a newReimbursement when save works', async () => {

		expect.hasAssertions();
        let mockReimbursements = new Reimbursements(2, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
        
		let result = await sut.save(mockReimbursements);

		expect(result).toBeTruthy();
    });

    test('should throw InternalServerError when save is envoked but query is unsuccesful', async () => {

		expect.hasAssertions();
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.save(mockReimbursements);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
	});
    
    test('should return void when deleteById works', async () => {

		expect.hasAssertions();
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
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
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.update(mockReimbursements);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });
    
    test('should return Reimbursements when update works', async () => {

		expect.hasAssertions();

        let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimbursements);

        let result = await sut.update(mockReimbursements);

        expect(result).toBeTruthy();
        expect(result).toBe(true);

    });

    test('should resolve to a Reimbursements object when getByAuthor retrieves a record from data source', async () => {

        expect.hasAssertions();

        let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
        (mockMapper.mapReimbursementResultSet as jest.Mock).mockReturnValue(mockReimbursements);

        let result = await sut.getByAuthor(mockReimbursements.author_id);

        expect(result).toBeTruthy();
        expect(result instanceof Reimbursements).toBe(false);
		
    });

    test('should throw InternalServerError when getByAuthor is envoked but query is unsuccesful', async () => {

		//expect.hasAssertions();
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation( () => { return false; }),
				release: jest.fn()
			};
		});

		try {
			await sut.getByAuthor(mockReimbursements.author_id);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });  
    
    test('should throw InternalServerError when getByAuthor is envoked but query is unsuccesful', async () => {

		//expect.hasAssertions();
		let mockReimbursements = new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 0, 3, 'Approved', 'Travel');
		(mockConnect as jest.Mock).mockImplementation( () => {
			return {
				query: jest.fn().mockImplementation(() => {mockReimbursements}),
				release: jest.fn()
			};
		});

		try {
			await sut.getByAuthor(1);
		} catch (e) {
			expect(e instanceof InternalServerError).toBe(true);
		}
    });   

});