"use client"
import Header from "@/components/Header"
import Navbar from "@/components/Navbar"
import Cookies from "universal-cookie"
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react"
import Loader from "@/components/Loader";

const Login = () => {
  const msalConfig = {
    auth: {
      clientId: 'c6ecd269-6a59-4fe6-ba2d-170e1d2260ef',
      authority: 'https://login.microsoftonline.com/0ae51e19-07c8-4e4b-bb6d-648ee58410f4',
      redirectUri: 'https://bgsw-assistant.bosch.tech/',
    },
    cache: {
      cacheLocation: "sessionStorage",
    },
  };

  let pca = new PublicClientApplication(msalConfig);
  const router = useRouter();
  const [authenticating, setAuthenticating] = useState(true);

  useEffect(() => {
    let isAuthenticating = false;
    const clearCache = async () => {
      try {
        await pca.clearCache();
      } catch (error) {
        console.error("Error clearing cache:", error);
      }
    };

    pca.addEventCallback((event) => {

      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        pca.setActiveAccount(account);
      }
    }, error => {
      console.log('error', error);
    });

    const handleLogin = async () => {
      if (isAuthenticating) return;

      isAuthenticating = true;

      await clearCache();
      //resetMsalInstance();

      const cookie = new Cookies(null, { path: "/" });
      const loginRequest = {
        scopes: ["openid"], // Add necessary scopes
      };
      try {
        await pca.initialize();

        if (pca.getActiveAccount()) {
          pca.getActiveAccount()
        } else {
          const authResponse = await pca.loginPopup(loginRequest);

          if (authResponse) {
            const user = {
              accountname: authResponse.account.name,
              accounttenantid: authResponse.account.tenantId,
              accountusername: authResponse.account.username,
              authority: authResponse.authority,
              token: authResponse.accessToken,
              scopes: authResponse.scopes,
            };
            
            cookie.set("user", user);
            setAuthenticating(false)
            router.push('/chat');
          }
        }
      } catch (error) {
        console.error("Error during login");
      } finally {
        isAuthenticating = false;
      }
    };
    handleLogin();
  }, []);

  return (
    <div className="min-h-screen max-h-screen flex flex-col App overflow-hidden items-center">
      <Header />
      <Navbar />
      <Loader />
    </div>
  )
}

export default Login
