import { Box, IconButton, Paper, Typography } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { purple } from "./constants";

export default function RoomCard({ item }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 112,
        borderRadius: "16px",
        border: "1px solid #dde1e9",
        bgcolor: "#f3f5fa",
        px: 3,
        py: 2.6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 22px rgba(41, 48, 67, 0.08)",
        },
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 21, fontWeight: 700, color: "#07090f" }}>
          {item.title}
        </Typography>
        <Typography sx={{ mt: 0.8, fontSize: 17, color: "#6f7580" }}>
          Sig'imi: {item.capacity}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
        <IconButton aria-label="delete" sx={{ ...actionButton, color: "#cf2029" }}>
          <FiTrash2 size={22} />
        </IconButton>
        <IconButton aria-label="edit" sx={actionButton}>
          <FiEdit2 size={22} />
        </IconButton>
      </Box>
    </Paper>
  );
}

const actionButton = {
  width: 34,
  height: 34,
  color: purple,
  borderRadius: "7px",
  "&:hover": {
    bgcolor: "#ebeef5",
  },
};
