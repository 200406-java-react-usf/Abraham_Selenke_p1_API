export const isValidId = (id: number): boolean => {
    return (id && typeof id === 'number' && Number.isInteger(id) && id > 0);
}

export const isValidString = (...strings: string[]): boolean => {
    for (let string of strings) {
        if (!string || typeof string !== 'string') {
            return false;
        }
    }
    return true;
}

export const isValidObject = (object: Object, ...nullableProps: string[]) => {
    return object && Object.keys(object).every(key => {
        if (nullableProps.includes(key)) {
            return true;
        }
        return object[key];
    });
}

export function isEmptyObject<A>(obj: A) {
    return obj && Object.keys(obj).length === 0;
}

export const isPropertyOf = (prop: string, type: any) => {

    if(!prop || !type) {
        return false;
    }

    let typeCreator = <A>(Type: (new () => A)): A => {
        return new Type();
    }

    let tempInstance;

    try{
        tempInstance = typeCreator(type);
    } catch {
        return false;
    }

    return Object.keys(tempInstance).includes(prop);
}

export default {
    isValidId, 
    isValidObject, 
    isValidString,
    isEmptyObject,
    isPropertyOf
}