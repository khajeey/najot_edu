import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { purple } from "./constants";
import { mutedCardSx } from "../../theme/surfaces";

export default function RoomCard({ item, onEdit, onDelete }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 96,
        borderRadius: "14px",
        ...mutedCardSx(theme),
        px: 2.5,
        py: 2,
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
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
          {item.title}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary" }}>
          Sig'imi: {item.capacity}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
        <IconButton aria-label="delete" onClick={onDelete} sx={{ ...actionButton, color: "#cf2029" }}>
          <FiTrash2 size={22} />
        </IconButton>
        <IconButton aria-label="edit" onClick={onEdit} sx={actionButton}>
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
