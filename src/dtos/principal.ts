export class Principal {

    id: number;
    username: string;
    roles: string;

    constructor(id: number, un: string, role: string) {
        this.id = id;
        this.username = un;
        this.roles = role;
    }
}