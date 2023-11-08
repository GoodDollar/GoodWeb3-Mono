# GoodDollar Client SDK
This is the gooddollar client sdk for integrating login into gooddollar in your website
- [Example App](https://gooddollar.netlify.app/) to test the functionality
- [Source Code to the example app](https://github.com/harjaapdhillon16/gooddollarLoginExample)

## SDK Utilities
 - createLoginLink to generate login link to redirect to the gooddollar wallet 
 - LoginButton to place a login button on your page to integrate login with gooddollar on your website
 - parseLoginResponse to verify if the login was successful and verified
 - useLogin is a hook that can be used instead of button to integrate login with gooddollar on your website

## Object schema for createLoginLink 

| Property Name | Purpose | Mandatory/Optional | Type |
| --- | --- | --- |  --- |
| redirectLink | gooddollar wallet link to redirect to | Optional | String |
| v | name of the vendor | Mandatory | String |
| web | web link for vendor | Mandatory | String |
| id | wallet address for vendor | Mandatory | String |
| r | array of information ex.['mobile','location'] | Mandatory | array |
| cbu | Callback URL | provide either rdu or cbu | String |
| rbu | Redirect URL | provide either rdu or cbu | String |

## Object schema for useLogin

| Property Name | Purpose | Mandatory/Optional | Type |
| --- | --- | --- | --- |
| gooddollarlink | wallet link returned by createLoginLink | Mandatory | String |
| cbu | Callback URL | provide either rdu or cbu | String |
| rbu | Redirect URL | provide either rdu or cbu | String |
| onLoginCallback | Function that has the data returned by wallet as the first argument | Mandatory | Function |

## Props for LoginButton

| Prop Name | Purpose | Mandatory/Optional | Type |
| --- | --- | --- | --- |
| gooddollarlink | wallet link returned by createLoginLink | Mandatory | String |
| cbu | Callback URL | provide either rdu or cbu | String |
| rbu | Redirect URL | provide either rdu or cbu | String |
| onLoginCallback | Function that has the data returned by wallet as the first argument | Mandatory | Function |

## example login with hook
```js
import {
  useLogin,
  createLoginLink,
  parseLoginResponse,
} from "@gooddollar/goodlogin-sdk";

const App() {
  const gooddollarLink = createLoginLink({
    v: "Google",
    web: "https://gooddollar.netlify.app",
    id: "0x09D2011Ca5781CA70810F6d82837648132762F9a",
    r: ["mobile", "location", "email", "name"],
    rdu: "https://gooddollar.netlify.app",
  });

  const loginCallBack = async (data) => {
    //to check if login response is valid or not 
    parseLoginResponse(data)
  }

  const onClick =  useLogin({
    rdu: gooddollarLink,
    gooddollarlink: rest.gooddollarlink,
    onLoginCallback: onLoginCallback,
  });

  return (
    <div className="App">
      <button onClick={onClick}>Login With Gooddollar</button>
    </div>
  );
}
```

## example login with button
```js
import {useState} from 'react';
import {
  LoginButton,
  createLoginLink,
  parseLoginResponse,
} from "@gooddollar/goodlogin-sdk";

function App() {
  const gooddollarLink = createLoginLink({
    v: "Google",
    web: "https://gooddollar.netlify.app",
    id: "0x09D2011Ca5781CA70810F6d82837648132762F9a",
    r: ["mobile", "location", "email", "name"],
    rdu: "https://gooddollar.netlify.app",
  });

  const [gooddollarData, setGooddollarData] = useState({});

  return (
    <div className="App">
        {Object.keys(gooddollarData).length === 0 ? (
          <>
            <LoginButton
              onLoginCallback={async (data) => {
              //to check if login response is valid or not 
              parseLoginResponse(data)
              setGooddollarData(data)
              }}
              gooddollarlink={gooddollarLink}
              style={{ fontSize: 20, padding: 20 }}
              rdu="gasdasd"
            >
              Loggin With GOODDOLLAR
            </LoginButton>
          </>
        ) : (
          <div>
            <p>Logged In</p>
            <p>Name : {gooddollarData.fullName}</p>
            <button
              onClick={() => {
                setGooddollarData({});
                window.location.href = "https://gooddollar.netlify.app";
              }}
              style={{ fontSize: 20, padding: 20 }}
            >
              Logout
            </button>
          </div>
        )}
    </div>
  );
}
```
