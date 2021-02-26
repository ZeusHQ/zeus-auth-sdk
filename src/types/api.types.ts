export interface IAPIResponse {
    success: boolean;
    error: string[];
    object?: any;
    objects?: any;
    type: string;
}