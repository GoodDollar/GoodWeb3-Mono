import { createContext, useContext } from 'react';

var GdSdkContext = createContext({
    web3: null,
    activeNetwork: ''
});
function useGdContextProvider() {
    return useContext(GdSdkContext);
}

export { GdSdkContext as G, useGdContextProvider as u };
