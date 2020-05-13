export class Reimbursements {

    reimbId: number;
    amount: number;
    submitted: Date;
    resolved: Date;
    description: string;
    authorId: number;
    resolvedId: number;
    statusId: number;
    typeId: number;

    constructor(id: number, amount: number, sub: Date, res: Date, des: string, aId: number, resId: number, satId: number, typId: number) {
        this.reimbId = id;
        this.amount = amount;
        this.submitted = sub;
        this.resolved = res;
        this.description = des;
        this.authorId = aId;
        this.resolvedId = resId;
        this.statusId = satId;
        this.typeId = typId;
    }
}