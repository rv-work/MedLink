import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; 
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
     <Web3Provider>
      <Toaster position="top-right" reverseOrder={false} />
      <App />
     </Web3Provider>
     </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
