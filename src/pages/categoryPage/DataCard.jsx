import { Box, IconButton, Paper, Typography } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { purple } from "./constants";

export default function DataCard({ item, onEdit, onDelete }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 210,
        borderRadius: "18px",
        bgcolor: "#f3f5fa",
        px: 3,
        py: 3.2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 26px rgba(41, 48, 67, 0.08)",
        },
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#07090f" }}>
              {item.title}
            </Typography>
            <Typography
              sx={{
                mt: 1.6,
                maxWidth: 390,
                minHeight: 54,
                color: "#8a9099",
                fontSize: 19,
                lineHeight: 1.35,
                fontWeight: 400,
              }}
            >
              {item.description}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, pt: 4.7, flexShrink: 0 }}>
            <IconButton aria-label="delete" onClick={onDelete} sx={cardActionButton}>
              <FiTrash2 size={22} />
            </IconButton>
            <IconButton aria-label="edit" onClick={onEdit} sx={cardActionButton}>
              <FiEdit2 size={22} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2.2 }}>
        {item.badges.map((badge) => (
          <Box
            key={badge}
            sx={{
              minWidth: 75,
              height: 38,
              px: 1.5,
              borderRadius: "7px",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2a2d34",
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

const cardActionButton = {
  width: 32,
  height: 32,
  color: "#8b919a",
  borderRadius: "7px",
  "&:hover": {
    bgcolor: "#ebeef5",
    color: purple,
  },
};
