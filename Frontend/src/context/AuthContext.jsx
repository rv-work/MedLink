import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
   
  const [isLoggedIn , setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchLoggedInStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include' 
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.success);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    }
    fetchLoggedInStatus();
  } , [])

  return(
    <AuthContext.Provider value = {{isLoggedIn , setIsLoggedIn}}>
      {children}
    </AuthContext.Provider>
  )

}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth =() => {
  return useContext(AuthContext);
}