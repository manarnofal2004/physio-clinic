import { Typography } from "@mui/material";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <Typography variant="h5">Physiotherapy Clinic</Typography> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
