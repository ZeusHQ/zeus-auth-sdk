# Zeus Auth SDK

## Installation
`yarn install zeus-auth`

## Provider Setup
```
// Import AuthProvider and AuthService
import { AuthProvider, AuthService } from "zeus-auth";

// Init AuthService with the zeus service public key
AuthService.init(process.env.NEXT_PUBLIC_ZEUS_AUTH_PUBLIC_KEY, () => { Router.push("/auth/login") });

// Wrap application with AuthProvider in order to use the hooks
export default class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props;

        return (
          <AuthProvider>
             <Component {...pageProps} />
          </AuthProvider>
        );
    }
}
```

## Hook Use

useAuth([403 callback function]);

```
import { useAuth } from "zeus-auth";
function Dashboard() {
  const onTokenExpired = () => {
    console.log("the access token has expired!"
  }
  
  const [authState, authDispatch] = useAuth(onTokenExpired);
  
  return <div>functional component using</div>;
}
```


## Service Use
### Init

AuthService.init([public key], [403 callback])
```
AuthService.init(process.env.NEXT_PUBLIC_ZEUS_AUTH_PUBLIC_KEY, () => { Router.push("/auth/login") });
```

### Email Signup
```
const response = await AuthService.signupWithEmailPassword({firstName: "John", lastName: "Doe", email: "john.doe@gmail.com", password: "Sekret1!"});
```

### Email Login
```
const response = await AuthService.loginWithEmailPassword({email: "john.doe@gmail.com", password: "Sekret1!"});
```

### Retrieving the access token
```
const accessToken = AuthService.getAccessToken();
```

### Initiate Reset Password
```
const response = await AuthService.initiateResetEmailPassword({email: "john.doe@gmail.com"})
```

### Complete Reset Password
```
const response = await AuthService.resetEmailPassword({password: "MoreSekret1!", passwordConfirmation: "MoreSekret1!", token: [retrieve from reset email link]})
```


authState will have the following data structure.
```
type IPresentations = {[key: string] IPresentation};
type IPresentationUsers = {[key: string] IPresentationUser};

const state = {
    me: (null as unknown) as IUser,
    loggedIn: false,
};
```

## Types
### APIResponse
```
export interface IAPIResponse {
    success: boolean;
    error: string[];
    object?: any;
    objects?: any;
    type: string;
}
```

### User
```
export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    roles: string[];
}
```

### Account
```
export interface IAccount {
    id: string;
    name: string;
    slug: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}
```

### AccountUser
```
export interface IAccountUser {
    id: string;
    userId: string;
    accountId: string;
    roles: string;
    createdAt: string;
    updatedAt: string;
}
```

### WaitingList
```
export interface IWaitingList {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
```

### WaitingListEmail
```
export interface IWaitingListEmail {
    id: string;
    waitingListId: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
```

### CRUD Types
```
export interface ISignupEmailPassword {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface ILoginEmailPassword {
    email: string;
    password: string;
}

export interface IAccountCreateAction {
    name: string;
    paymentMethodId: string;
}

export interface IAccountUpdateAction {
    name?: string;
    paymentMethodId?: string;
}


export interface IInitiateResetEmailPassword {
    email: string;
}

export interface IResetEmailPassword {
    token: string;
    password: string;
    passwordConfirmation: string;
}

export interface IWaitingListCreate {
    name: string;
}

export interface IWaitingListEmailCreate {
    waitingListName: string;
    email: string;
}
```



## Development
### `yarn test`

Launches the test runner

### `yarn build`

Builds the SDK in the lib folder.
