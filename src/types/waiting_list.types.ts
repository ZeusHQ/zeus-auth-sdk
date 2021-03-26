export interface IWaitingList {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface IWaitingListEmail {
    id: string;
    waitingListId: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface IWaitingListCreate {
    name: string;
}

export interface IWaitingListEmailCreate {
    waitingListName: string;
    email: string;
}