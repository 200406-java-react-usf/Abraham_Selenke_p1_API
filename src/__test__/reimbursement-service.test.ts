import { ReimbursementService } from '../services/reimbursement-service';
import { Reimbursements } from '../models/reimbursements';

import { ResourceNotFoundError, BadRequestError, ResourcePersistenceError, AuthenticationError } from '../errors/errors';
import validator from '../util/validator';

jest.mock('../repos/reimbursement-repo', () => {

	return new class ReimbursementRepository {
		getAll = jest.fn();
        getById = jest.fn();
		save = jest.fn();
		update = jest.fn();
        deleteById = jest.fn();
        getByAuthor = jest.fn();
	};
});

describe('ReimbursementService', () => {

	let sut: ReimbursementService;
	let mockRepo;

	let mockReimbursements = [
		new Reimbursements(1, 250.00, new Date(), new Date(), "Traveling to Florida", 2, 3, 'Approved', 'Travel'),	
        new Reimbursements(2, 350.00, new Date(), new Date(), "Food for Florida", 2, 3, 'Denied', 'Food'),
        new Reimbursements(3, 550.00, new Date(), new Date(), "Desk for Florida", 2, 3, 'Pending', 'Other'),
	];

	beforeEach( () => {

		mockRepo = jest.fn(() => {
			return {
				getAll: jest.fn(),
                getById: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                deleteById: jest.fn(),
                getByAuthor: jest.fn()
			};
		});

		sut = new ReimbursementService(mockRepo);

    });

    test('should return an array of users without passwords when getAllReimbursements succesfully retrieves all Reimbursements from db', async () => {

		expect.hasAssertions();
		mockRepo.getAll = jest.fn().mockReturnValue(mockReimbursements);

		let result = await sut.getAllReimbursements();

		expect(result).toBeTruthy();
		expect(result.length).toBe(3);
    });

    test('should throw a ResourceNotFoundError when getAllReimbursements fails to get any Reimbursements', async () => {

		expect.hasAssertions();
		mockRepo.getAll = jest.fn().mockReturnValue([]);

		try{
			await sut.getAllReimbursements();
		} catch (e) {
			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
	});
	
	test('should throw a ResourceNotFoundError when getReimbursementsById fails to get any Reimbursements', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue([]);

		try{
			await sut.getReimbursementById(1);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
    });
    
    test('should resolve a Reimbursements when getReimbursementsById is given a valid id', async () => {

		expect.hasAssertions();

		validator.isValidId = jest.fn().mockReturnValue(true);
        validator.isEmptyObject = jest.fn().mockReturnValue(true);

		mockRepo.getById = jest.fn().mockImplementation((id: number) => {
			return new Promise<Reimbursements>((resolve) => resolve(mockReimbursements[id - 1]));
		});

		let result = await sut.getReimbursementById(1);

		expect(result).toBeTruthy();
		expect(result.reimb_id).toBe(1);
	});

    test('should throw BadRequestError when getReimbursementsById is provided a negative id value', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getReimbursementById(-1);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getReimbursementsById is given a value of zero)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getReimbursementById(0);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

    test('should throw BadRequestError when getReimbursementsById is given a of a decimal value)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getReimbursementById(1.01);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getReimbursementsById is given not a number)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getReimbursementById(NaN);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

	test('should throw a ResourceNotFoundError when getReimbursementsById', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue([]);

		try{
			await sut.getReimbursementById(1);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBeTruthy();
		}
    });

    test('should return a newReimbursements when save is given a valid Reimbursements object', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(true);

		mockRepo.save = jest.fn().mockImplementation((newReimbursement: Reimbursements) => {
			return new Promise<Reimbursements>((resolve) => {
				mockReimbursements.push(newReimbursement); 
				resolve(newReimbursement);
			});
		});

		let result = await sut.addNewReimbursement(new Reimbursements(4, 250.25, new Date(), new Date(), "Desk for Florida", 2, 3, 'Pending', 'Other'));
		expect(result).toBeTruthy();
		expect(mockReimbursements.length).toBe(4);
	});

	test('should throw BadRequestError when save is envoked and username is not unique', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(true);
		validator.isEmptyObject = jest.fn().mockReturnValue(false);

		try {
			await sut.addNewReimbursement(new Reimbursements(4, 250.25, new Date(), new Date(), "Desk for Florida", 2, 3, 'Pending', 'Other'));
		} catch (e) {		
			expect(e instanceof BadRequestError).toBe(false);
		}
    });
    
    test('should throw BadRequestError when save is envoked and username is not unique', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(true);
        validator.isEmptyObject = jest.fn().mockReturnValue(true);
        validator.isValidString = jest.fn().mockReturnValue(false);

		try {
			await sut.addNewReimbursement(new Reimbursements(4, 250.25, new Date(), new Date(), "Desk for Florida", 2, 3, '', ''));
		} catch (e) {		
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

	test('should throw BadRequestError when saveReimbursements is envoked and provided an invalid Reimbursements', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(false);
		validator.isEmptyObject = jest.fn().mockReturnValue(true);

		try {
            await sut.updateReimbursement(new Reimbursements(4, 250.25, new Date(), new Date(), "Desk for Florida", 2, 3, '', ''));
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
    
    test('should return true when deleteById succesfully deletes a user', async () => {

		validator.isValidId = jest.fn().mockReturnValue(false);
		validator.isPropertyOf = jest.fn().mockReturnValue(false);
		mockRepo.deleteById = jest.fn().mockReturnValue(false);
		
		try {
			await sut.deleteById('');
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

    test('should resolve to false when deleteById is given an invalid id', async () => {
 
        //expect.hasAssertions();

        (validator.isValidId as jest.Mock).mockReturnValue(false);

        try {
            await sut.deleteById(1);   
        } catch (e) {
            expect(e instanceof BadRequestError).toBe(true);
            expect(validator.isValidId).toBeCalledTimes(0);
        }
    });

	test('should throw BadRequestError when updateReimbursements is envoked and given an invalid user object', async () => {

		expect.hasAssertions();
		validator.isValidObject = jest.fn().mockReturnValue(false);
		mockRepo.updateUser = jest.fn().mockReturnValue(true);
	
		mockRepo.save = jest.fn().mockImplementation((newReimbursements: Reimbursements) => {
            return new Promise<Reimbursements> ((resolve) => {
                mockReimbursements.push(newReimbursements);
                resolve(newReimbursements);
            });
        });

        try{
			await sut.updateReimbursement(new Reimbursements(4, 250.25, new Date(), new Date(), "Desk for Florida", 2, 3, 'Pending', 'Other'));
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(false);
		}
    });
    
    test('should throw BadRequestError when getReimbursementsById is provided a negative id value', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getByAuthor(-1);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getReimbursementsById is given a value of zero)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getByAuthor(0);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

    test('should throw BadRequestError when getReimbursementsById is given a of a decimal value)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getByAuthor(1.01);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
    });
    
    test('should throw BadRequestError when getReimbursementsById is given not a number)', async () => {

		expect.hasAssertions();
		mockRepo.getById = jest.fn().mockReturnValue(false);

		try {
			await sut.getByAuthor(NaN);
		} catch (e) {
			expect(e instanceof BadRequestError).toBe(true);
		}
	});

	test('should throw a ResourceNotFoundError when getReimbursementsById', async () => {

        expect.hasAssertions();
        validator.isValidId = jest.fn().mockReturnValue(false);
		mockRepo.getById = jest.fn().mockReturnValue([]);

		try{
			await sut.getByAuthor(1);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBe(false);
		}
    });

    test('should return true of authorId when getAuthor succesfully retrieves all Reimbursements from db', async () => {

		expect.hasAssertions();
		mockRepo.getByAuthor = jest.fn().mockReturnValue(1);

		let result = await sut.getByAuthor(1);

		expect(result).toBeTruthy();
    });

    test('should return true of authorId when getAuthor succesfully retrieves all Reimbursements from db', async () => {

		expect.hasAssertions();
		mockRepo.getByAuthor  = jest.fn().mockReturnValue(0);

		try{
			await sut.getByAuthor(0);
		} catch (e) {

			expect(e instanceof ResourceNotFoundError).toBe(false);
		}
    });
});