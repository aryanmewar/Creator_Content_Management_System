import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ContentProvider } from "./context/ContentContext.jsx";
import { InstructorProvider } from "./context/InstructorContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <InstructorProvider>
        <ContentProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "14px",
                borderRadius: "12px",
                background: "#1e293b",
                color: "#f1f5f9",
              },
              success: {
                iconTheme: { primary: "#4ade80", secondary: "#1e293b" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#1e293b" },
              },
            }}
          />
        </ContentProvider>
      </InstructorProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
