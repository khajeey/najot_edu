import { useEffect, useState } from "react";
import { Alert, Box, Button, Divider, Paper, Snackbar, Typography } from "@mui/material";
import { FiKey, FiMail, FiShield, FiUsers } from "react-icons/fi";
import { pageTitleSx } from "../../theme/surfaces";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { getCurrentUser } from "../../api/auth";
import ForgotPasswordDialog from "../ForgotPasswordDialog";

const flame = "#e8740e";

const ROLE_LABEL = {
  STUDENT: "O'quvchi",
  STUDENTS: "O'quvchi",
  TALABA: "O'quvchi",
};

export default function StudentSettings() {
  const user = getCurrentUser();
  const email = user?.raw?.email || "";
  const role = ROLE_LABEL[user?.role] || "O'quvchi";
  const initial = (email.trim()[0] || "O").toUpperCase();

  const [groups, setGroups] = useState([]);
  const [groupsError, setGroupsError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/students/my/groups")
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        setGroups(list.map((g) => g.groupName || g.name).filter(Boolean));
      })
      .catch((error) => {
        if (active) setGroupsError(getApiErrorMessage(error, "Guruhlarni yuklashda xatolik"));
      });
    return () => {
      active = false;
    };
  }, []);

  const infoItems = [
    { icon: FiMail, label: "Email", value: email || "—" },
    { icon: FiShield, label: "Rol", value: role },
  ];

  return (
    <Box>
      <Typography component="h1" sx={{ ...pageTitleSx, mb: 3 }}>
        Sozlamalar
      </Typography>

      <Box sx={{ display: "flex", gap: 3, alignItems: "stretch", flexDirection: { xs: "column", md: "row" } }}>
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
          <Box sx={{ position: "relative", height: 96, bgcolor: flame }}>
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
                bgcolor: flame,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {initial}
            </Box>
          </Box>
          <Box sx={{ mt: 8, textAlign: "center", px: 2 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.primary", wordBreak: "break-word" }}>
              {email || "O'quvchi"}
            </Typography>
            <Typography sx={{ fontSize: 15, color: "text.secondary", mt: 0.4 }}>{role}</Typography>
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

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2.5 }}>
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
                      bgcolor: "#fdeede",
                      color: flame,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: "text.primary", wordBreak: "break-word" }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontSize: 19, fontWeight: 700, color: "text.primary", mb: 2 }}>
            Guruhlarim
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.4 }}>
            {groups.length > 0 ? (
              groups.map((name, index) => (
                <Box
                  key={`${name}-${index}`}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.9,
                    height: 36,
                    px: 1.6,
                    borderRadius: "10px",
                    bgcolor: "#fdeede",
                    color: "#c4620b",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  <FiUsers size={16} />
                  {name}
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 15, color: groupsError ? "#ef4444" : "text.secondary" }}>
                {groupsError || "Guruhlar yo'q"}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ fontSize: 19, fontWeight: 700, color: "text.primary", mb: 1.5 }}>
            Xavfsizlik
          </Typography>
          <Button
            startIcon={<FiKey size={18} />}
            onClick={() => setPasswordOpen(true)}
            sx={{
              height: 44,
              px: 2.4,
              borderRadius: "10px",
              bgcolor: flame,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#cf6709" },
            }}
          >
            Parolni o'zgartirish
          </Button>
        </Paper>
      </Box>

      <ForgotPasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onDone={() => {
          setPasswordOpen(false);
          setToast("Parol muvaffaqiyatli o'zgartirildi");
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast("")}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
