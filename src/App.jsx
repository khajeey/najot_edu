import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import AppThemeProvider from "./theme/AppThemeProvider";
import { router } from "./router";
import PageLoader from "./components/PageLoader";

export default function App() {
  return (
    <AppThemeProvider>
      <Suspense fallback={<PageLoader fullScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppThemeProvider>
  );
}
