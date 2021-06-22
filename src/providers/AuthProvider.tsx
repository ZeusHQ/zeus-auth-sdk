import React, { useContext, useEffect, useReducer } from 'react';
import { IUser } from '../types';

const initialState = {
    me: (null as unknown) as IUser,
    loggedIn: false,
};
export type IAuthState = typeof initialState;

export const AuthStateContext = React.createContext({} as any);

enum ActionType {
    SetMe = 'setMe',
    Logout = 'logout'
}

interface ISetMeAction {
    type: ActionType;
    payload: IUser;
}

interface ILogoutAction {
    type: ActionType;
    payload: null;
}

type Actions = ISetMeAction | ILogoutAction;

const reducer: React.Reducer<{}, Actions> = (state, action) => {
    switch (action.type) {
        case ActionType.SetMe:
            return { ...state, me: action.payload, loggedIn: true };

        case ActionType.Logout:
            return { ...initialState };

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

export const ZEUS_AUTH_LOCAL_STORAGE_KEY = 'zeus.auth.storage';

export class ZeusAuth {
    private static instance: ZeusAuth;

    state: typeof initialState;
    dispatch: any;

    constructor(state: any, dispatch: any) {
        this.state = state;
        this.dispatch = dispatch;
    }

    static dispatchAction = (action: Actions) => ZeusAuth.instance.dispatch(action);
    static isLoggedIn = () => ZeusAuth.instance.state.loggedIn;
    static me = () => ZeusAuth.instance.state.me;

    static init(state: any, dispatch: any): ZeusAuth {
        if (!ZeusAuth.instance) {
            ZeusAuth.instance = new ZeusAuth(state, dispatch);
        }

        return ZeusAuth.instance;
    }
}

export const AuthProvider = ({ children }: any) => {
    let localState = { ...initialState };
    if (typeof localStorage !== 'undefined' && localStorage.getItem(ZEUS_AUTH_LOCAL_STORAGE_KEY)) {
        localState = JSON.parse(localStorage.getItem(ZEUS_AUTH_LOCAL_STORAGE_KEY) || '') || { ...initialState };
    }
    const [state, dispatch] = useReducer(reducer, (localState || initialState) as IAuthState);

    ZeusAuth.init(state, dispatch);

    if (typeof localStorage !== 'undefined') {
        useEffect(() => {
            localStorage.setItem(ZEUS_AUTH_LOCAL_STORAGE_KEY, JSON.stringify(state));
        }, [state]);
    }

    return (
        <AuthStateContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthStateContext.Provider>
    );
};

// useContext hook - export here to keep code for global auth state
// together in this file, allowing user info to be accessed and updated
// in any functional component using the hook
export const useAuth = (onLoggedOut?: any) => {
    if (!ZeusAuth.isLoggedIn()) {
        if (onLoggedOut) onLoggedOut();
    }

    const logoutAction = () => ZeusAuth.dispatchAction({
        type: ActionType.Logout
    } as ILogoutAction);

    const actions = {
        logout: logoutAction,
    }

    return { actions, ctx: useContext(AuthStateContext) };
}
