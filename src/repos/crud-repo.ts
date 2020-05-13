export interface CrudRepository<A> {
    getAll(): Promise<A[]>;
    //getById(id: number): Promise<A>;
    //save(newObj: A): Promise<A>;
    //update(updateObj: A): Promise<boolean>;
    //deleteById(id: number): Promise<boolean>;
}