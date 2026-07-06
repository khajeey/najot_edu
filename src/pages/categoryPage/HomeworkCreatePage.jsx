import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import { api, getApiErrorMessage } from "../../api/axiosClient";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";
import { fetchLessonTopics, resolveLessonId } from "./lessonApi";
import TopicComboField from "./TopicComboField";

const green = "#20b486";
const MAX_FILE_BYTES = 200 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HomeworkCreatePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const groupName = location.state?.groupName || "Guruh";

  const [topicOptions, setTopicOptions] = useState([]);
  const [topicValue, setTopicValue] = useState({ lessonId: null, customTopic: "" });
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchLessonTopics(groupId).then(setTopicOptions);
  }, [groupId]);

  const handleFileChange = (selected) => {
    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_BYTES) {
      setErrorMessage(
        `Fayl juda katta (${formatFileSize(selected.size)}). Maksimal ${formatFileSize(MAX_FILE_BYTES)}.`
      );
      setFile(null);
      return;
    }

    setErrorMessage("");
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!topicValue.lessonId && !topicValue.customTopic?.trim()) {
      setErrorMessage("Mavzuni tanlang yoki kiriting");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Izoh maydonini to'ldiring");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const lessonId = await resolveLessonId({
        groupId,
        topicValue,
        description: title.trim(),
      });

      const formData = new FormData();
      formData.append("lesson_id", String(Number(lessonId)));
      formData.append("group_id", String(Number(groupId)));
      formData.append("title", title.trim());
      if (file) {
        formData.append("file", file);
      }

      const { data } = await api.post("/homework", formData);

      if (data?.success === false) {
        throw new Error(data.message || "Uyga vazifa yaratishda xatolik");
      }

      navigate(`/groups/${groupId}`, { state: { tab: 1 } });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Uyga vazifa yaratishda xatolik"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/groups/${groupId}`, { state: { tab: 1 } })}
          sx={{
            width: 36,
            height: 36,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <FiArrowLeft size={20} />
        </IconButton>
        <Typography sx={pageTitleSx}>Yangi uyga vazifa yaratish</Typography>
      </Box>

      <Typography sx={{ mb: 2, color: "text.secondary", fontSize: 14 }}>{groupName}</Typography>

      <Paper elevation={0} sx={{ ...panelPaperSx, p: { xs: 2, md: 3 } }}>
        <FormField label="Mavzu" required>
          <TopicComboField
            options={topicOptions}
            value={topicValue}
            onChange={setTopicValue}
            placeholder="Mavzulardan tanlang yoki o'zingiz kiriting"
          />
        </FormField>

        <FormField label="Izoh" required>
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "10px", overflow: "hidden" }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.8,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexWrap: "wrap",
                gap: 0.6,
                bgcolor: "action.hover",
              }}
            >
              {["H1", "H2", "B", "I", "U", "•", "1."].map((tool) => (
                <Box
                  key={tool}
                  sx={{
                    minWidth: 28,
                    height: 24,
                    px: 0.8,
                    borderRadius: "6px",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "text.secondary",
                  }}
                >
                  {tool}
                </Box>
              ))}
            </Box>
            <TextField
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
              fullWidth
              multiline
              minRows={6}
              sx={textareaStyles}
            />
          </Box>
        </FormField>

        <Box
          component="label"
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minHeight: 140,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "action.hover",
            cursor: "pointer",
            "&:hover": { borderColor: green, bgcolor: "action.selected" },
          }}
        >
          <FiUploadCloud size={30} color={green} />
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: "text.primary" }}>
            {file ? file.name : "Faylni tanlash yoki shu yerga tashlang (ixtiyoriy)"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Rasm yoki video biriktirish shart emas · Maksimal hajm: {formatFileSize(MAX_FILE_BYTES)}
          </Typography>
          <input
            hidden
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.webm,.zip"
            onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
          />
        </Box>

        {errorMessage && (
          <Typography sx={{ mt: 2, color: "#ef4444", fontWeight: 600, fontSize: 14 }}>
            {errorMessage}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/groups/${groupId}`, { state: { tab: 1 } })}
            sx={cancelButtonStyles}
            disabled={isSaving}
          >
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} sx={submitButtonStyles}>
            {isSaving ? "E'lon qilinmoqda..." : "E'lon qilish"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function FormField({ label, required, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ mb: 0.8, fontSize: 14, fontWeight: 700, color: "text.primary" }}>
        {required && (
          <Box component="span" sx={{ color: "#ef4444" }}>
            *{" "}
          </Box>
        )}
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const textareaStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    fontSize: 14,
    alignItems: "flex-start",
    "& fieldset": { border: "none" },
  },
};

const cancelButtonStyles = {
  height: 40,
  px: 2,
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  borderColor: "divider",
};

const submitButtonStyles = {
  height: 40,
  px: 2.5,
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  bgcolor: green,
  color: "#fff",
  "&:hover": { bgcolor: "#1aa377" },
};
