export enum Type {
    MOM,
    NANNY
}

export interface UserPayload {
    id: string;
    email: string;
    name: string;
    surname: string;
    type: number;
}