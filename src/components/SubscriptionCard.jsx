import { useEffect, useState } from "react";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { FiBell, FiRefreshCw } from "react-icons/fi";
import {
  formatRemaining,
  getSubscriptionState,
  renewSubscription,
  SUBSCRIPTION_DURATION_MS,
} from "../utils/subscription";

export default function SubscriptionCard({ collapsed }) {
  const [state, setState] = useState(() => getSubscriptionState());

  useEffect(() => {
    const timer = setInterval(() => {
      setState(getSubscriptionState());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRenew = () => {
    renewSubscription();
    setState(getSubscriptionState());
  };

  if (collapsed) return null;

  const progress = state.expired
    ? 0
    : Math.min(100, (state.remainingMs / SUBSCRIPTION_DURATION_MS) * 100);

  return (
    <Box
      sx={{
        mx: 1.25,
        mb: 1.6,
        p: 2,
        borderRadius: "16px",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, #2a1f3d 0%, #1a2438 100%)"
            : "linear-gradient(145deg, #f8f4ff 0%, #fff5f5 100%)",
        border: "1px solid",
        borderColor: state.expired ? "#fecaca" : "#ddd6fe",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.25)"
            : "0 8px 24px rgba(116, 86, 216, 0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: state.expired ? "#fee2e2" : "#ede9fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiBell size={24} color={state.expired ? "#ef4444" : "#7456d8"} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
            Obuna
          </Typography>
          <Typography
            sx={{
              mt: 0.4,
              fontSize: 13,
              fontWeight: 600,
              color: state.expired ? "#ef4444" : "#7456d8",
            }}
          >
            {state.expired ? "Obunangiz tugagan" : `Qolgan vaqt: ${formatRemaining(state.remainingMs)}`}
          </Typography>
        </Box>
      </Box>

      {!state.expired && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1.8,
            height: 6,
            borderRadius: 3,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              bgcolor: "#7456d8",
            },
          }}
        />
      )}

      <Button
        fullWidth
        startIcon={<FiRefreshCw size={18} />}
        onClick={handleRenew}
        sx={{
          mt: 1.8,
          height: 42,
          borderRadius: "10px",
          bgcolor: state.expired ? "#ef4444" : "#7456d8",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "none",
          "&:hover": {
            bgcolor: state.expired ? "#dc2626" : "#684bcf",
          },
        }}
      >
        Obunani yangilash
      </Button>
    </Box>
  );
}
