import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, Divider, Paper, Typography } from "@mui/material";
import { FiCalendar, FiMail, FiMapPin, FiPhone, FiUsers } from "react-icons/fi";
import { pageTitleSx } from "../../theme/surfaces";
import { getApiErrorMessage } from "../../api/axiosClient";
import { getProfilePhotoUrl } from "../../utils/photos";
import { fetchTeacherProfile } from "./teacherApi";

const green = "#19b16a";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export default function TeacherProfile() {
  const context = useOutletContext() || {};
  const [profile, setProfile] = useState(context.profile || null);
  const [isLoading, setIsLoading] = useState(!context.profile);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (context.profile) {
      setProfile(context.profile);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    fetchTeacherProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((error) => {
        if (active) setErrorMessage(getApiErrorMessage(error, "Profilni yuklashda xatolik"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [context.profile]);

  const photoUrl = getProfilePhotoUrl(profile?.photo);
  const initial = profile?.full_name?.trim()?.[0]?.toUpperCase() || "O";
  const groups = Array.isArray(profile?.groups) ? profile.groups : [];

  const infoItems = [
    { icon: FiMail, label: "Email", value: profile?.email },
    { icon: FiPhone, label: "Telefon raqam", value: profile?.phone },
    { icon: FiMapPin, label: "Manzil", value: profile?.address },
    { icon: FiCalendar, label: "Ro'yxatdan o'tgan sana", value: formatDate(profile?.created_at) },
  ];

  return (
    <Box>
      <Typography component="h1" sx={{ ...pageTitleSx, mb: 3 }}>
        Profil
      </Typography>

      {isLoading && <Typography sx={{ color: "text.secondary" }}>Yuklanmoqda...</Typography>}
      {errorMessage && !isLoading && <Typography sx={{ color: "#ef4444" }}>{errorMessage}</Typography>}

      {!isLoading && !errorMessage && profile && (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "stretch",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 300 },
              flexShrink: 0,
              borderRadius: "16px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              pb: 3,
            }}
          >
            <Box sx={{ position: "relative", height: 96, bgcolor: green }}>
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  bottom: -52,
                  transform: "translateX(-50%)",
                  width: 116,
                  height: 116,
                  borderRadius: "50%",
                  border: "5px solid",
                  borderColor: "background.paper",
                  bgcolor: green,
                  color: "#fff",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  fontWeight: 700,
                }}
              >
                {photoUrl ? (
                  <Box
                    component="img"
                    src={photoUrl}
                    alt={profile.full_name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  initial
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 8, textAlign: "center" }}>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: "text.primary" }}>
                {profile.full_name || "—"}
              </Typography>
              <Typography sx={{ fontSize: 15, color: "text.secondary", mt: 0.4 }}>O'qituvchi</Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: "16px",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 2.5, md: 3.5 },
            }}
          >
            <Typography sx={{ fontSize: 19, fontWeight: 700, color: "text.primary", mb: 2.5 }}>
              Shaxsiy ma'lumotlar
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 2.5,
              }}
            >
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box key={item.label} sx={{ display: "flex", gap: 1.4, minWidth: 0 }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 34,
                        height: 34,
                        borderRadius: "9px",
                        bgcolor: "#e8f7ef",
                        color: green,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{item.label}</Typography>
                      <Typography
                        sx={{
                          fontSize: 15.5,
                          fontWeight: 700,
                          color: "text.primary",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value || "—"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography sx={{ fontSize: 19, fontWeight: 700, color: "text.primary", mb: 2 }}>
              Guruhlar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.4 }}>
              {groups.length > 0 ? (
                groups.map((groupName, index) => (
                  <Box
                    key={`${groupName}-${index}`}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.9,
                      height: 36,
                      px: 1.6,
                      borderRadius: "10px",
                      bgcolor: "#e8f7ef",
                      color: "#16915a",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    <FiUsers size={16} />
                    {groupName}
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: 15, color: "text.secondary" }}>Guruhlar yo'q</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
