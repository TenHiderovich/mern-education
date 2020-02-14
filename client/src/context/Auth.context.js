import { createContext } from 'react';

const noop = () => {}

export const AuthContext = createContext({
    loken: null,
    userId: null,
    login: noop,
    logOut: noop,
    isAuthenticated: false
})