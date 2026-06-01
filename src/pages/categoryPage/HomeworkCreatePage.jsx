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
import { purple } from "./constants";
import { fetchLessonTopics, resolveLessonId } from "./lessonApi";
import TopicComboField from "./TopicComboField";

const green = "#20b486";

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

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("Izoh maydonini to'ldiring");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const lessonId = await resolveLessonId({
        groupId,
        lessonDate: new Date().toISOString().slice(0, 10),
        topicMode: topicValue.lessonId ? "curriculum" : "other",
        topicValue,
        description: title.trim(),
      });

      const formData = new FormData();
      formData.append("lesson_id", String(lessonId));
      formData.append("group_id", String(groupId));
      formData.append("title", title.trim());

      if (file) {
        formData.append("file", file);
      }

      const { data } = await api.post("/homework", formData);

      if (!data.success) {
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 3 }}>
        <IconButton onClick={() => navigate(`/groups/${groupId}`, { state: { tab: 1 } })} sx={backIconStyles}>
          <FiArrowLeft size={22} />
        </IconButton>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#10131a" }}>Yangi uyga vazifa yaratish</Typography>
      </Box>

      <Typography sx={{ mb: 2.5, color: "#6b7280", fontSize: 15 }}>{groupName}</Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "12px", border: "1px solid #e7e9ef", bgcolor: "#fff" }}>
        <FormField label="Mavzu" required>
          <TopicComboField
            options={topicOptions}
            value={topicValue}
            onChange={setTopicValue}
            placeholder="Mavzulardan tanlang yoki o'zingiz kiriting"
          />
        </FormField>

        <FormField label="Izoh" required>
          <Box sx={{ border: "1px solid #dce2eb", borderRadius: "10px", overflow: "hidden" }}>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: "1px solid #edf0f4",
                display: "flex",
                flexWrap: "wrap",
                gap: 0.8,
                bgcolor: "#fafbfc",
              }}
            >
              {["H1", "H2", "B", "I", "U", "•", "1."].map((tool) => (
                <Box
                  key={tool}
                  sx={{
                    minWidth: 32,
                    height: 28,
                    px: 1,
                    borderRadius: "6px",
                    bgcolor: "#fff",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
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
              minRows={8}
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
            minHeight: 160,
            border: "2px dashed #d8dee8",
            borderRadius: "12px",
            bgcolor: "#fafbfc",
            cursor: "pointer",
            "&:hover": { bgcolor: "#f5fbf8", borderColor: green },
          }}
        >
          <FiUploadCloud size={34} color={green} />
          <Typography sx={{ fontWeight: 600, color: "#374151" }}>
            {file ? file.name : "Faylni tanlash yoki shu yerga tashlang"}
          </Typography>
          <input hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </Box>

        {errorMessage && (
          <Typography sx={{ mt: 2, color: "#ef4444", fontWeight: 600 }}>{errorMessage}</Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
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
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ mb: 1, fontSize: 15, fontWeight: 700, color: "#374151" }}>
        {required && <Box component="span" sx={{ color: "#ef4444" }}>* </Box>}
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const backIconStyles = {
  width: 40,
  height: 40,
  border: "1px solid #e5e7eb",
  bgcolor: "#fff",
};

const textareaStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    fontSize: 15,
    alignItems: "flex-start",
    "& fieldset": { border: "none" },
  },
};

const cancelButtonStyles = {
  height: 46,
  px: 2.5,
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 700,
  color: "#374151",
  borderColor: "#dce2eb",
};

const submitButtonStyles = {
  height: 46,
  px: 2.8,
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 700,
  bgcolor: green,
  color: "#fff",
  "&:hover": { bgcolor: "#1aa377" },
};
