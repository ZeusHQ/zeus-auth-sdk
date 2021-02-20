import CamelCase from 'camelcase-keys';
import Cookies from 'universal-cookie';

import * as ZeusAuthTypes from "../types";

const handleAPIResponseObject = async (result: any, resolve: any) => {
    const obj = CamelCase(result) as ZeusAuthTypes.IAPIResponse;
    if (obj.success) {
        resolve([obj.object, null]);
    } else {
        resolve([null, obj.errors]);
    }
}


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

const SIGNUP_URL = `/api/v1/users`;
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

    static init(publicKey: string, onTokenExpired: any, local = false): ZeusAuthService {
        if (!ZeusAuthService.instance) {
            ZeusAuthService.instance = new ZeusAuthService(publicKey, onTokenExpired, local);
        }

        return ZeusAuthService.instance;
    }

    public signup(user: ZeusAuthTypes.IRegisterEmailPassword): Promise<ZeusAuthTypes.IAPIResponse> {
        return new Promise((resolve, reject) => {
            this.fetchUnauthed(
                this.publicKey,
                this.baseUrl + SIGNUP_URL,
                { user },
                'POST'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })

    }

    public loginWithEmailPassword(session: ZeusAuthTypes.ILoginEmailPassword): Promise<ZeusAuthTypes.IAPIResponse> {

        return new Promise((resolve, reject) => {
            this.fetchUnauthed(
                this.publicKey,
                this.baseUrl + LOGIN_EMAIL_PASSWORD_URL,
                { session },
                'POST'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })

    }

    public me(): Promise<ZeusAuthTypes.IUser> {
        return new Promise((resolve, reject) => {
            this.fetchAuthed(
                this.publicKey,
                this.baseUrl + ME_URL,
                {},
                'GET'
            )
                .then((result) => handleAPIResponseObject(result, resolve))
                .catch((err) => reject(err));
        })
    }

    public saveToken(token: string) {
        const cookies = new Cookies();
        cookies.set('token', token, { path: '/' });
        return Promise.resolve();
    }

    public checkAuthToken(publicKey: string, token: string): Promise<any> {
        return this.fetchAuthed(publicKey, ME_URL, {}, 'GET', token);
    }

    public async authenticateTokenSsr(publicKey: string, req: any) {
        const cookies = new Cookies(req ? req.headers.cookie : null);
        const token = cookies.get('token');

        if (token) {
            const response = await this.checkAuthToken(publicKey, token);

            if (!response.id) {
                cookies.remove('token');
                // const navService = new NavService();
                // navService.redirectUser('/login', ctx);
            }

            return { user: response, token };
        } else {
            return {};
        }
    }

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
                'X-ZEUS-KEY': publicKey,
            },
            method: type
        } as any;

        let queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || {};

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

        const cookies = new Cookies();
        const token = cookies.get('token');

        const actualToken = tokenOverride ? tokenOverride : token;

        if (!actualToken) {
            const cookies = new Cookies();
            cookies.remove('token');
            return this.onTokenExpired();
        }

        let fetchOpts = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ZEUS-KEY': publicKey,
                Authorization: 'Bearer ' + actualToken
            },
            method: type
        } as any;

        let queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || {};

        if (type !== "GET" && data) {
            fetchOpts.body = JSON.stringify(decamelize(data));
        }

        return fetch(`${url}?${queryParams}`, fetchOpts)
            .then((response: Response) => {
                if (response.status === 401) {
                    const cookies = new Cookies();
                    cookies.remove('token');
                    // Router.push("/auth/login");
                    // } else if (type === "GET" && response.status === 404) {
                    //     Router.push("/404");
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