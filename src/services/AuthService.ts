import CamelCase from 'camelcase-keys';

import * as ZeusAuthTypes from "../types";

const handleAPIResponseObject = (result: any, resolve: any): Promise<ZeusAuthTypes.IAPIResponse> => {
    return resolve(CamelCase(result) as ZeusAuthTypes.IAPIResponse);
}

const ZEUS_AUTH_TOKEN_KEY = "zeus.auth.token";

const decamelize = (params: any, separator?: string | undefined) => {
    separator = typeof separator === 'undefined' ? '_' : separator;

    const keys = Object.keys(params);

    return keys.reduce((output: any, key: string) => {
        const newKey = key
            .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
            .toLowerCase();
        if (typeof (params[key]) === "object") {
            output[newKey] = decamelize(params[key], separator);
        } else {
            output[newKey] = params[key];
        }
        return output;
    }, {});
}

const SIGNUP_URL = `/api/v1/registrations`;
const LOGIN_EMAIL_PASSWORD_URL = `/api/v1/sessions`;
const ME_URL = `/api/v1/users/me`;

class ZeusAuthService {
    private static instance: ZeusAuthService;

    publicKey: string;
    baseUrl: string;
    onTokenExpired: any;

    constructor(publicKey: string, onTokenExpired: any, local: boolean) {
        this.publicKey = publicKey;
        this.baseUrl = local ? "http://localhost:3003" : "https://auth.zeusdev.io";
        this.onTokenExpired = onTokenExpired;


    }

    static getAccessToken() {
        return ZeusAuthService.instance.getAccessToken();
    }

    static logout() {
        ZeusAuthService.instance.clearToken();
        return ZeusAuthService.instance.onTokenExpired();
    }

    static init(publicKey: string, onTokenExpired: any, local = false): ZeusAuthService {
        if (!ZeusAuthService.instance) {
            ZeusAuthService.instance = new ZeusAuthService(publicKey, onTokenExpired, local);
        }

        return ZeusAuthService.instance;
    }

    static signupWithEmailPassword(user: ZeusAuthTypes.ISignupEmailPassword): Promise<ZeusAuthTypes.IAPIResponse> {
        return new Promise((resolve, reject) => {
            ZeusAuthService.instance.fetchUnauthed(
                ZeusAuthService.instance.publicKey,
                ZeusAuthService.instance.baseUrl + SIGNUP_URL,
                { user },
                'POST'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })

    }

    static loginWithEmailPassword(session: ZeusAuthTypes.ILoginEmailPassword): Promise<ZeusAuthTypes.IAPIResponse> {

        return new Promise((resolve, reject) => {
            ZeusAuthService.instance.fetchUnauthed(
                ZeusAuthService.instance.publicKey,
                ZeusAuthService.instance.baseUrl + LOGIN_EMAIL_PASSWORD_URL,
                { session },
                'POST'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })

    }

    static me(): Promise<ZeusAuthTypes.IUser> {
        return new Promise((resolve, reject) => {
            ZeusAuthService.instance.fetchAuthed(
                ZeusAuthService.instance.publicKey,
                ZeusAuthService.instance.baseUrl + ME_URL,
                {},
                'GET'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })
    }



    public clearToken() {
        localStorage.removeItem(ZEUS_AUTH_TOKEN_KEY);
    }

    public getAccessToken() {
        const token = localStorage.getItem(ZEUS_AUTH_TOKEN_KEY);
        return token;
    }

    public saveToken(token: string) {
        localStorage.setItem(ZEUS_AUTH_TOKEN_KEY, token);
        return Promise.resolve();
    }

    public checkAuthToken(publicKey: string, token: string): Promise<any> {
        return this.fetchAuthed(publicKey, ME_URL, {}, 'GET', token);
    }

    // public async authenticateTokenSsr(publicKey: string, req: any) {
    //     // const cookies = new Cookies(req ? req.headers.cookie : null);
    //     // const token = cookies.get(ZEUS_AUTH_TOKEN_KEY);

    //     if (token) {
    //         const response = await this.checkAuthToken(publicKey, token);

    //         if (!response.id) {
    //             cookies.remove(ZEUS_AUTH_TOKEN_KEY);
    //             // const navService = new NavService();
    //             // navService.redirectUser('/login', ctx);
    //         }

    //         return { user: response, token };
    //     } else {
    //         return {};
    //     }
    // }

    public fetch(url: string, data: object, type: string): Promise<any> {
        return fetch(`${url}`, {
            body: JSON.stringify(decamelize(data)),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            method: type
        })
            .then((response: Response) => {
                return response.json()
            })
            .then(this.handleErrors as any)
            .catch(error => {
                throw error;
            });
    }

    optionsToRequestParams = (options: { [key: string]: any }) => {
        return Object.keys(options).map(key => key + '=' + options[key]).join('&');
    }

    public fetchUnauthed(publicKey: string, url: string, data: object, type: string): Promise<any> {
        let fetchOpts = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ZEUS-SERVICE-PUBLIC-KEY': publicKey,
            },
            method: type
        } as any;

        let queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || "";

        if (type !== "GET" && data) {
            fetchOpts.body = JSON.stringify(decamelize(data));
        }

        return fetch(`${url}?${queryParams}`, fetchOpts)
            .then((response: Response) => {
                const authHeader = response.headers.get("Authorization");

                if (authHeader) {
                    const token = authHeader.split("Bearer ")[1];
                    this.saveToken(token);
                }

                return response.json()
            })
            .then(this.handleErrors as any)
            .catch(error => {
                throw error;
            });
    }

    public fetchAuthed(publicKey: string, url: string, data: object, type: string, tokenOverride?: string): Promise<any> {
        const token = ZeusAuthService.instance.getAccessToken();

        const actualToken = tokenOverride ? tokenOverride : token;

        if (!actualToken) {
            ZeusAuthService.instance.clearToken();
            return this.onTokenExpired();
        }

        let fetchOpts = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ZEUS-SERVICE-PUBLIC-KEY': publicKey,
                Authorization: 'Bearer ' + actualToken
            },
            method: type
        } as any;

        let queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || "";

        if (type !== "GET" && data) {
            fetchOpts.body = JSON.stringify(decamelize(data));
        }

        return fetch(`${url}?${queryParams}`, fetchOpts)
            .then((response: Response) => {
                if (response.status === 401) {
                    ZeusAuthService.instance.clearToken();
                    return this.onTokenExpired();
                } else {
                    return response.json();
                }
            })
            .then(this.handleErrors)
            .catch(error => {
                throw error;
            });
    }

    public handleErrors(response: string): string {
        if (response === 'TypeError: Failed to fetch') {
            throw Error('Server error.');
        }
        return response;
    }
}

export default ZeusAuthService;