import { Box, Paper, Typography } from "@mui/material";

export default function SimpleCategoryPage({ title }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 220,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}>{title}</Typography>
        <Typography sx={{ mt: 1, fontSize: 16, color: "text.secondary" }}>
          {title} sahifasi
        </Typography>
      </Box>
    </Paper>
  );
}
