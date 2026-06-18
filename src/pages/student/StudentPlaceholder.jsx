import { Box, Paper, Typography } from "@mui/material";

export default function StudentPlaceholder({ title }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color: "text.primary", mb: 3 }}>
        {title}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          py: 8,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 17, color: "text.secondary" }}>
          "{title}" bo'limi tez orada qo'shiladi.
        </Typography>
      </Paper>
    </Box>
  );
}
