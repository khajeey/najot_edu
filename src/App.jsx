import { RouterProvider } from "react-router-dom";
import AppThemeProvider from "./theme/AppThemeProvider";
import { router } from "./router";

export default function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}
