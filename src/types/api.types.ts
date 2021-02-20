export interface IAPIResponse {
    success: boolean;
    errors: string[];
    object?: any;
    objects?: any;
    type: string;
}