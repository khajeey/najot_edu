import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaLayerGroup } from "react-icons/fa";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";

import { getProfilePhotoUrl } from "../../utils/photos";

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await api.get(`/students/one/${studentId}`);

        if (!data.success) {
          throw new Error(data.message || "Talaba topilmadi");
        }

        setStudent(normalizeStudentDetail(data.data));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Talaba ma'lumotlarini yuklashda xatolik"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [studentId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: purple }} />
      </Box>
    );
  }

  if (errorMessage || !student) {
    return (
      <Box>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate("/students")} sx={backButtonStyles}>
          Orqaga
        </Button>
        <Typography sx={{ mt: 3, color: "#ef4444", fontWeight: 600 }}>
          {errorMessage || "Talaba topilmadi"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={roundIconButtonStyles}>
          <FiArrowLeft size={20} />
        </IconButton>
        <Typography sx={{ fontSize: 28, fontWeight: 700 }}>Talaba profili</Typography>
      </Box>

      <Paper elevation={0} sx={heroPaperStyles}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          {student.avatar ? (
            <Box
              component="img"
              src={student.avatar}
              alt={student.name}
              sx={{ width: 96, height: 96, borderRadius: "16px", objectFit: "cover" }}
            />
          ) : (
            <Box sx={avatarFallbackStyles}>{student.name.charAt(0)}</Box>
          )}
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Chip label="Talaba" size="small" sx={roleChipStyles} />
            <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 800 }}>{student.name}</Typography>
            <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
              <InfoRow icon={FiPhone} value={student.phone} />
              <InfoRow icon={FiMail} value={student.email} />
              <InfoRow icon={FiMapPin} value={student.address} />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.5,
          mt: 2.5,
        }}
      >
        <Paper elevation={0} sx={panelStyles}>
          <Typography sx={panelTitleStyles}>Guruhlari</Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
            {student.groups.length > 0 ? (
              student.groups.map((group) => (
                <Box
                  key={group.id || group.name}
                  onClick={() => group.id && navigate(`/groups/${group.id}`)}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: group.id ? "pointer" : "default",
                    "&:hover": group.id ? { borderColor: purple, bgcolor: "action.hover" } : undefined,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaLayerGroup color={purple} />
                    <Typography sx={{ fontWeight: 700 }}>{group.name}</Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "text.secondary" }}>Guruh biriktirilmagan</Typography>
            )}
          </Box>
        </Paper>

        <Paper elevation={0} sx={panelStyles}>
          <Typography sx={panelTitleStyles}>Qo'shimcha ma'lumot</Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.4 }}>
            <DetailRow label="Tug'ilgan sana" value={student.birthDate} />
            <DetailRow label="Yaratilgan sana" value={student.createdAt} />
            <DetailRow label="Holati" value={student.isActive ? "Faol" : "Nofaol"} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function normalizeStudentDetail(student) {
  const groups = (student.groups || student.GroupStudent || [])
    .map((item) => {
      const group = item.Group || item.group || item;
      if (!group || typeof group !== "object") {
        return item.name ? { id: null, name: item.name || item } : null;
      }
      return { id: group.id, name: group.name || "" };
    })
    .filter(Boolean);

  return {
    id: student.id,
    name: student.full_name || student.name || "",
    avatar: getProfilePhotoUrl(student.photo),
    phone: student.phone || "—",
    email: student.email || "—",
    address: student.address || "—",
    birthDate: formatDate(student.birth_date),
    createdAt: formatDate(student.created_at),
    isActive: student.is_active ?? true,
    groups,
  };
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function InfoRow({ icon: Icon, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
      <Icon size={16} />
      <Typography sx={{ fontSize: 15 }}>{value || "—"}</Typography>
    </Box>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

const backButtonStyles = { textTransform: "none", color: "text.secondary", fontWeight: 700 };

const roundIconButtonStyles = {
  width: 40,
  height: 40,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
};

const heroPaperStyles = {
  borderRadius: "16px",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  p: 3,
};

const avatarFallbackStyles = {
  width: 96,
  height: 96,
  borderRadius: "16px",
  bgcolor: "#eee8fb",
  color: purple,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 36,
  fontWeight: 800,
};

const roleChipStyles = {
  bgcolor: "#eee8fb",
  color: purple,
  fontWeight: 700,
};

const panelStyles = {
  borderRadius: "12px",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  p: 2.5,
};

const panelTitleStyles = { fontSize: 20, fontWeight: 700 };
