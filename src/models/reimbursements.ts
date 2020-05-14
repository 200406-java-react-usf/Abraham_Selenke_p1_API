export class Reimbursements {

    reimbId: number;
    amount: number;
    submitted: Date;
    resolved: Date;
    description: string;
    author: string;
    resolver: number;
    status: number;
    type: number;

    constructor(id: number, amount: number, sub: Date, res: Date, des: string, author: string, resovler: number, status: number, type: number) {
        this.reimbId = id;
        this.amount = amount;
        this.submitted = sub;
        this.resolved = res;
        this.description = des;
        this.author = author;
        this.resolver = resovler;
        this.status = status;
        this.type = type;
    }
}