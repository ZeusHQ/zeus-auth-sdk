export interface IAccountCreateAction {
    name: string;
    paymentMethodId: string;
}
export interface IAccountUpdateAction {
    name?: string;
    paymentMethodId?: string;
}
export interface IAccount {
    id: string;
    name: string;
    slug: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
export interface IAccountUser {
    id: string;
    userId: string;
    accountId: string;
    roles: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=account.types.d.ts.map