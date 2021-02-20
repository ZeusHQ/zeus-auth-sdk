import React, { useContext, useEffect, useReducer } from 'react';
import { IUser } from '../types';
export const AuthStateContext = React.createContext({});

const initialState = {
    me: (null as unknown) as IUser,
    loggedIn: false,
};

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

const LOCAL_STORAGE_KEY = 'zeus.auth.storage';

export const AuthProvider = ({ children }: any) => {
    let localState = null;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '');
    }
    const [state, dispatch] = useReducer(reducer, localState || initialState);

    if (typeof localStorage !== 'undefined') {
        useEffect(() => {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }, [state]);
    }
    return (
        <AuthStateContext.Provider value={[state, dispatch]}>
            {children}
        </AuthStateContext.Provider>
    );
};

// useContext hook - export here to keep code for global auth state
// together in this file, allowing user info to be accessed and updated
// in any functional component using the hook
export const useAuth: any = () => useContext(AuthStateContext);
