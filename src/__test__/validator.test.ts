import { isValidId, isValidString, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { User } from "../models/user";
import { Reimbursements } from "../models/reimbursements";

describe('validator', () => {

    test('should return true when isValidId is provided a valid id', () => {
        
        expect.assertions(3);

        let result1 = isValidId(1);
        let result2 = isValidId(999999);
        let result3 = isValidId(Number('123'));

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);

    });

    test('should return false when isValidId is provided a invalid id (falsy)', () => {

        expect.assertions(0);

        let result1 = isValidId(NaN);
        let result2 = isValidId(0);
        let result3 = isValidId(Number(null));

        expect(result1).toBeFalsy;
        expect(result2).toBeFalsy;
        expect(result3).toBeFalsy;

    });

    test('should return false when isValidId is provided a invalid id (decimal)', () => {

        expect.assertions(3);

        let result1 = isValidId(3.14);
        let result2 = isValidId(0.01);
        let result3 = isValidId(Number(4.20));

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);

    });

    test('should return false when isValidId is provided a invalid id (non-positive)', () => {

        expect.assertions(3);

        let result1 = isValidId(0);
        let result2 = isValidId(-1);
        let result3 = isValidId(Number(-23));

        expect(result1).toBe(0);
        expect(result2).toBe(false);
        expect(result3).toBe(false);

    });

    test('should return true when isValidStrings is provided valid string(s)', () => {

        expect.assertions(3);

        let result1 = isValidString('valid');
        let result2 = isValidString('valid', 'string', 'values');
        let result3 = isValidString(String('weird'), String('but valid'));

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);

    });

    test('should return false when isValidStrings is provided invalid string(s)', () => {

        expect.assertions(3);

        let result1 = isValidString('');
        let result2 = isValidString('some valid', '', 'but not all');
        let result3 = isValidString(String(''), String('still weird'));

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);

    });

    test('should return true when isValidObject is provided valid object with no nullable props', () => {

        expect.assertions(2);

        let result1 = isValidObject(new Reimbursements(1, 250.00, new Date(), new Date(), 'Travel to training', 1, 1, 'Pending', 'Food'));
        let result2 = isValidObject(new User(1, 'turmboi', 'numberone', 'boi', 'JJ', 'jj@test.com', 'Admin'));

        expect(result1).toBe(true);
        expect(result2).toBe(true);

    });

    test('should return true when isValidObject is provided valid object with nullable prop(s)', () => {

        expect.assertions(2);

        let result1 = isValidObject(new Reimbursements(1, 250.00, new Date(), new Date(), 'Travel to training', 1, 1, 'Pending', 'Food'), 'id');
        let result2 = isValidObject(new User(3, 'turmboi', 'numberone', 'boi', 'JJ', 'jj@test.com', 'Admin'), 'id');

        expect(result1).toBe(true);
        expect(result2).toBe(true);

    });

    test('should return true when isPropertyOf is provided a known property of a given constructable type', () => {

        expect.assertions(3);

        let result1 = isPropertyOf('id', User);
        let result2 = isPropertyOf('username', User);
        let result3 = isPropertyOf('amount', Reimbursements);

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);

    });

    test('should return false when isPropertyOf is provided a unknown property of a given constructable type', () => {

        expect.assertions(3);

        let result1 = isPropertyOf('not-real', User);
        let result2 = isPropertyOf('fake', User);
        let result3 = isPropertyOf('sav', Reimbursements);

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);

    });

    test('should return false when isPropertyOf is provided a non-constructable type', () => {

        expect.assertions(4);

        let result1 = isPropertyOf('shouldn\'t work', {x: 'non-constructable'});
        let result2 = isPropertyOf('nope', 2);
        let result3 = isPropertyOf('nuh-uh', false);
        let result4 = isPropertyOf('won\'t work', Symbol('asd'));

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
        expect(result4).toBe(false);  

    });

    test('should return false when isEmptyObject is provided an empty object', () => {

        expect.assertions(3);

        let result1 = isEmptyObject(['']);
        let result2 = isEmptyObject(['', '', '']);
        let result3 = isEmptyObject(['jk','','js']);

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);

    });

})