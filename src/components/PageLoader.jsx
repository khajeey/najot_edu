import { Box, CircularProgress } from "@mui/material";

export default function PageLoader({ fullScreen = false }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: fullScreen ? "100vh" : "60vh",
      }}
    >
      <CircularProgress sx={{ color: "#7456d8" }} />
    </Box>
  );
}
