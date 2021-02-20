import * as ZeusAuthTypes from "../types";
declare class ZeusAuthService {
    private static instance;
    publicKey: string;
    baseUrl: string;
    onTokenExpired: any;
    constructor(publicKey: string, onTokenExpired: any, local: boolean);
    static init(publicKey: string, onTokenExpired: any, local?: boolean): ZeusAuthService;
    signup(user: ZeusAuthTypes.IRegisterEmailPassword): Promise<ZeusAuthTypes.IAPIResponse>;
    loginWithEmailPassword(session: ZeusAuthTypes.ILoginEmailPassword): Promise<ZeusAuthTypes.IAPIResponse>;
    me(): Promise<ZeusAuthTypes.IUser>;
    saveToken(token: string): Promise<void>;
    checkAuthToken(publicKey: string, token: string): Promise<any>;
    authenticateTokenSsr(publicKey: string, req: any): Promise<{
        user: any;
        token: any;
    } | {
        user?: undefined;
        token?: undefined;
    }>;
    fetch(url: string, data: object, type: string): Promise<any>;
    optionsToRequestParams: (options: {
        [key: string]: any;
    }) => string;
    fetchUnauthed(publicKey: string, url: string, data: object, type: string): Promise<any>;
    fetchAuthed(publicKey: string, url: string, data: object, type: string, tokenOverride?: string): Promise<any>;
    handleErrors(response: string): string;
}
export default ZeusAuthService;
//# sourceMappingURL=AuthService.d.ts.map