import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { purple } from "./constants";
import { mutedCardSx } from "../../theme/surfaces";

export default function DataCard({ item, onEdit, onDelete, isArchived }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 190,
        borderRadius: "14px",
        ...mutedCardSx(theme),
        px: 2.5,
        py: 2.5,
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
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "text.primary" }}>
              {item.title}
            </Typography>
            <Typography
              sx={{
                mt: 1.2,
                maxWidth: 390,
                minHeight: 44,
                color: "text.secondary",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {item.description}
            </Typography>
          </Box>

          {isArchived ? (
            <Box sx={{ pt: 4.7, flexShrink: 0 }}>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#f3f4f6",
                  color: "text.secondary",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                Arxivlangan
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, pt: 4.7, flexShrink: 0 }}>
              <IconButton aria-label="delete" onClick={onDelete} sx={cardActionButton}>
                <FiTrash2 size={22} />
              </IconButton>
              <IconButton aria-label="edit" onClick={onEdit} sx={cardActionButton}>
                <FiEdit2 size={22} />
              </IconButton>
            </Box>
          )}
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
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.primary",
              fontSize: 13,
              fontWeight: 600,
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
  color: "text.secondary",
  borderRadius: "7px",
  "&:hover": {
    bgcolor: "action.hover",
    color: purple,
  },
};
