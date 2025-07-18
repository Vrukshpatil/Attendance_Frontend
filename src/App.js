// // 

// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import NotFound from './pages/NotFound';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import HomePage from './pages/HomePage';
// import ManagerDashboard from './pages/ManagerDashboard';

// /** Protect Dashboard Routes */
// const ProtectedRoute = ({ children, role }) => {
//   const token = localStorage.getItem('access_token');
//   const sessionActive = localStorage.getItem('session_active');
//   const storedRole = localStorage.getItem('role');

//   // If no token or session is not marked active or wrong role
//   if (!token || !sessionActive || storedRole !== role) {
//     return <Navigate to="/home" />;
//   }

//   return children;
// };


// /** Auto-redirect logged-in users from root/login/home to dashboard */
// const RedirectIfAuthenticated = ({ children }) => {
//   const token = localStorage.getItem('access_token');
//   const role = localStorage.getItem('role');

//   if (token) {
//     return <Navigate to={`/${role}`} />;
//   }
//   return children;
// };



// function App() {
//     useEffect(() => {
//     const clearSessionOnClose = () => {
//       localStorage.removeItem('session_active');
//     };

//     window.addEventListener('beforeunload', clearSessionOnClose);

//     return () => {
//       window.removeEventListener('beforeunload', clearSessionOnClose);
//     };
//   }, []);

//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route
//           path="/login"
//           element={
//             <RedirectIfAuthenticated>
//               <LoginPage />
//             </RedirectIfAuthenticated>
//           }
//         />
//         <Route path="/signup" element={<SignupPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//         <Route
//           path="/"
//           element={
//             <RedirectIfAuthenticated>
//               <HomePage />
//             </RedirectIfAuthenticated>
//           }
//         />
//         <Route
//           path="/home"
//           element={
//             <RedirectIfAuthenticated>
//               <HomePage />
//             </RedirectIfAuthenticated>
//           }
//         />

//         {/* Protected Dashboard Routes */}
//         <Route
//           path="/employee"
//           element={
//             <ProtectedRoute role="employee">
//               <EmployeeDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute role="admin">
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/manager"
//           element={
//             <ProtectedRoute role="manager">
//               <ManagerDashboard />
//             </ProtectedRoute>
//           }
//         />

//         {/* Fallback */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Router>
//   );
// }



// export default App;



// src/App.js
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ManagerDashboard from './pages/ManagerDashboard';
import SessionValidator from './pages/SessionValidator';

/** Protect Dashboard Routes */
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('access_token');
  const sessionActive = localStorage.getItem('session_active');
  const storedRole = localStorage.getItem('role');

  // If no token, session not active, or wrong role, redirect to Home
  if (!token || !sessionActive || storedRole !== role) {
    return <Navigate to="/home" />;
  }

  return children;
};

/** Auto-redirect logged-in users from root/login/home to their dashboard */
const RedirectIfAuthenticated = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const sessionActive = localStorage.getItem('session_active');

  if (token && sessionActive) {
    return <Navigate to={`/${role}`} />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const beforeUnloadHandler = () => {
      const now = Date.now();
      localStorage.setItem('unload_time', now.toString());
    };

    const loadHandler = () => {
      const lastUnload = localStorage.getItem('unload_time');
      const now = Date.now();

      // If unload was >1s ago, treat it as a tab/browser close
      if (lastUnload && now - parseInt(lastUnload) > 1000) {
        localStorage.removeItem('session_active');
      }

      // Clean up
      localStorage.removeItem('unload_time');
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('load', loadHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('load', loadHandler);
    };
  }, []);


  return (
    <Router>
      <SessionValidator>
        <Routes>
          <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<RedirectIfAuthenticated><HomePage /></RedirectIfAuthenticated>} />
          <Route path="/home" element={<RedirectIfAuthenticated><HomePage /></RedirectIfAuthenticated>} />

          <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionValidator>
    </Router>
  );

}

export default App;
