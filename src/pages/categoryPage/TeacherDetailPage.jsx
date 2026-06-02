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
import { FaLayerGroup, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";

import { getProfilePhotoUrl } from "../../utils/photos";

export default function TeacherDetailPage() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await api.get(`/teachers/one/${teacherId}`);

        if (!data.success) {
          throw new Error(data.message || "O'qituvchi topilmadi");
        }

        setTeacher(normalizeTeacherDetail(data.data));
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "O'qituvchi ma'lumotlarini yuklashda xatolik"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [teacherId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: purple }} />
      </Box>
    );
  }

  if (errorMessage || !teacher) {
    return (
      <Box>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate("/teachers")} sx={backButtonStyles}>
          Orqaga
        </Button>
        <Typography sx={{ mt: 3, color: "#ef4444", fontWeight: 600 }}>{errorMessage || "O'qituvchi topilmadi"}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={roundIconButtonStyles}>
          <FiArrowLeft size={20} />
        </IconButton>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#10131a" }}>O'qituvchi profili</Typography>
      </Box>

      <Paper elevation={0} sx={heroPaperStyles}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          {teacher.avatar ? (
            <Box
              component="img"
              src={teacher.avatar}
              alt={teacher.name}
              sx={{ width: 96, height: 96, borderRadius: "16px", objectFit: "cover" }}
            />
          ) : (
            <Box sx={avatarFallbackStyles}>{teacher.name.charAt(0)}</Box>
          )}
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Chip label="O'qituvchi" size="small" sx={roleChipStyles} />
            <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 800, color: "#10131a" }}>{teacher.name}</Typography>
            <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
              <InfoRow icon={FiPhone} value={teacher.phone} />
              <InfoRow icon={FiMail} value={teacher.email} />
              <InfoRow icon={FiMapPin} value={teacher.address} />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2,
          my: 2.5,
          "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
        }}
      >
        <StatCard label="Guruhlar" value={teacher.groups.length} icon={FaLayerGroup} />
        <StatCard label="Talabalar" value={teacher.studentsCount} icon={FaUserGraduate} />
        <StatCard label="Tajriba" value={teacher.experience} icon={FaUserTie} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2.5,
        }}
      >
        <Paper elevation={0} sx={panelStyles}>
          <Typography sx={panelTitleStyles}>Guruhlari</Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.2 }}>
            {teacher.groups.length > 0 ? (
              teacher.groups.map((group) => (
                <Box
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  sx={groupRowStyles}
                >
                  <Typography sx={{ fontWeight: 700, color: purple }}>{group.name}</Typography>
                  <Typography sx={{ fontSize: 14, color: "#6b7280" }}>{group.course || "—"}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "#9ba0a8" }}>Guruh biriktirilmagan</Typography>
            )}
          </Box>
        </Paper>

        <Paper elevation={0} sx={panelStyles}>
          <Typography sx={panelTitleStyles}>Qo'shimcha ma'lumot</Typography>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.4 }}>
            <DetailRow label="Jinsi" value={teacher.gender} />
            <DetailRow label="Tug'ilgan sana" value={teacher.birthDate} />
            <DetailRow label="Yaratilgan sana" value={teacher.createdAt} />
            <DetailRow label="Holati" value={teacher.isActive ? "Faol" : "Nofaol"} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function normalizeTeacherDetail(teacher) {
  const groups = (teacher.groups || teacher.GroupTeacher || [])
    .map((item) => {
      const group = item.Group || item.group || item;
      if (!group || typeof group !== "object") return null;

      return {
        id: group.id,
        name: group.name || "",
        course: group.course?.name || group.course || "",
      };
    })
    .filter(Boolean);

  const studentsCount = groups.reduce((sum, group) => sum + (group.studentsCount || 0), 0)
    || teacher.students_count
    || teacher.student_count
    || 0;

  return {
    id: teacher.id,
    name: teacher.full_name || teacher.name || "",
    avatar: getProfilePhotoUrl(teacher.photo),
    phone: teacher.phone || "—",
    email: teacher.email || "—",
    address: teacher.address || "—",
    gender: teacher.gender || "—",
    birthDate: formatDate(teacher.birth_date),
    createdAt: formatDate(teacher.created_at),
    isActive: teacher.is_active ?? true,
    experience: teacher.experience ? `${teacher.experience} yil` : "—",
    groups,
    studentsCount,
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#4b5563" }}>
      <Icon size={16} />
      <Typography sx={{ fontSize: 15 }}>{value || "—"}</Typography>
    </Box>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography sx={{ color: "#6b7280" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, color: "#111827" }}>{value}</Typography>
    </Box>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Paper elevation={0} sx={statCardStyles}>
      <Icon size={24} color={purple} />
      <Typography sx={{ mt: 1, color: "#6b7280", fontSize: 15 }}>{label}</Typography>
      <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}</Typography>
    </Paper>
  );
}

const backButtonStyles = {
  textTransform: "none",
  color: "#4b5563",
  fontWeight: 700,
};

const roundIconButtonStyles = {
  width: 40,
  height: 40,
  border: "1px solid #e5e7eb",
  bgcolor: "#fff",
};

const heroPaperStyles = {
  borderRadius: "16px",
  bgcolor: "#fff",
  border: "1px solid #e7e9ef",
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
  bgcolor: "#fff",
  border: "1px solid #e7e9ef",
  p: 2.5,
};

const panelTitleStyles = {
  fontSize: 20,
  fontWeight: 700,
  color: "#111827",
};

const groupRowStyles = {
  p: 1.5,
  borderRadius: "10px",
  border: "1px solid #edf0f4",
  cursor: "pointer",
  transition: "border-color 160ms ease, background-color 160ms ease",
  "&:hover": {
    borderColor: "#d8cff5",
    bgcolor: "#faf8ff",
  },
};

const statCardStyles = {
  borderRadius: "12px",
  bgcolor: "#fff",
  border: "1px solid #e7e9ef",
  p: 2.2,
  minHeight: 120,
};
