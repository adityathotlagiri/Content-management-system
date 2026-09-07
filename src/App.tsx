// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CMSRoutes } from "./routes/cmsRoutes";
import { CMSAuthProvider } from "./context/CMSAuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./Components/cms/shared/ToastContainer";
import { CMSNav } from "./Components/cms/shared/CMSNav";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CMSAuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/cms/videos" replace />} />
            <Route
              path="/cms/*"
              element={
                <>
                  <CMSNav />
                  <CMSRoutes />
                </>
              }
            />
          </Routes>
          <ToastContainer />
        </CMSAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}