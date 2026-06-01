import { Box, Paper, Typography } from "@mui/material";
import { border } from "./constants";

export default function SimpleCategoryPage({ title }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 220,
        borderRadius: "10px",
        border: `1px solid ${border}`,
        bgcolor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#15151b" }}>{title}</Typography>
        <Typography sx={{ mt: 1, fontSize: 16, color: "#6b7280" }}>
          {title} sahifasi
        </Typography>
      </Box>
    </Paper>
  );
}
