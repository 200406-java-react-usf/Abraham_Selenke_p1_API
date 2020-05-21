export class Principal {

    user_id: number;
    username: string;
    roles: string;

    constructor(id: number, un: string, role: string) {
        this.user_id = id;
        this.username = un;
        this.roles = role;
    }
}