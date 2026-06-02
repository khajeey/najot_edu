import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import { getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import {
  checkHomeworkAnswer,
  fetchHomeworkResults,
  gradeToStatus,
} from "./homeworkApi";
import { formatHomeworkDateTime } from "./homeworkUtils";
import { isVideoMedia, resolveMediaUrl } from "./mediaUrls";
import { pageTitleSx, panelPaperSx } from "../../theme/surfaces";

const green = "#20b486";

export default function HomeworkAnswerCheckPage() {
  const { groupId, homeworkId, answerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [answer, setAnswer] = useState(null);
  const [grade, setGrade] = useState(60);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const topic = location.state?.topic || "Uyga vazifa";
  const endsAt = location.state?.endsAt;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const all = await fetchHomeworkResults(groupId, homeworkId);
        const found = all.find((item) => Number(item.homeworkAnswerId) === Number(answerId));

        if (!found) {
          throw new Error("Javob topilmadi");
        }

        setAnswer(found);
        setGrade(found.grade != null ? Number(found.grade) : 60);
        setComment(found.comment || "");
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Javobni yuklashda xatolik"));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [groupId, homeworkId, answerId]);

  const statusLabel = useMemo(() => {
    if (!answer) return "—";
    const status = answer.status || gradeToStatus(grade);
    if (status === "ACCEPTED") return "Qabul qilingan";
    if (status === "REJECTED") return "Qaytarilgan";
    if (status === "NOT_DONE") return "Bajarilmagan";
    return "Kutayapti";
  }, [answer, grade]);

  const statusColor =
    statusLabel === "Qabul qilingan"
      ? { bgcolor: "#e8f7e9", color: green }
      : statusLabel === "Qaytarilgan"
        ? { bgcolor: "#fde8e8", color: "#e54848" }
        : { bgcolor: "#fff8e6", color: "#d97706" };

  const handleSubmit = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      await checkHomeworkAnswer(groupId, homeworkId, {
        grade,
        title: comment.trim(),
        homework_answer_id: answerId,
      });

      navigate(`/groups/${groupId}/homework/${homeworkId}/check`, {
        state: { tab: location.state?.tab ?? 0 },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Baholashda xatolik"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: purple }} />
      </Box>
    );
  }

  if (errorMessage && !answer) {
    return (
      <Box>
        <Button startIcon={<FiArrowLeft />} onClick={() => navigate(-1)} sx={{ textTransform: "none" }}>
          Orqaga
        </Button>
        <Typography sx={{ mt: 2, color: "#ef4444" }}>{errorMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/groups/${groupId}/homework/${homeworkId}/check`)}
          sx={{ width: 36, height: 36, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          <FiArrowLeft size={20} />
        </IconButton>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          Kutayotganlar &gt; Uyga vazifa
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ ...panelPaperSx, p: 2.5, mb: 2 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>Uy vazifasi</Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Izoh:</Typography>
        <Typography sx={{ fontSize: 14 }}>{topic}</Typography>
        {endsAt && (
          <Typography sx={{ mt: 1.5, fontSize: 13, color: "text.secondary" }}>
            Tugash: {formatHomeworkDateTime(endsAt)}
          </Typography>
        )}
      </Paper>

      <Paper elevation={0} sx={{ ...panelPaperSx, p: 2.5, mb: 2 }}>
        <Typography sx={pageTitleSx}>{answer?.studentName}</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1.5, mb: 2 }}>
          <Meta label="Vaqti" value={formatHomeworkDateTime(answer?.submittedAt)} />
          <Meta label="Fayllar soni" value={String(answer?.files?.length || 0)} />
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Status</Typography>
            <Chip label={statusLabel} size="small" sx={{ mt: 0.5, fontWeight: 700, ...statusColor }} />
          </Box>
        </Box>

        {answer?.files?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>
              Fayl: {answer.files.length}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
              {answer.files.map((file, index) => {
                const url = resolveMediaUrl(file);
                const video = isVideoMedia(file);

                return video ? (
                  <Box
                    key={index}
                    component="video"
                    src={url}
                    controls
                    sx={{ width: 200, maxHeight: 140, borderRadius: "8px", bgcolor: "#000" }}
                  />
                ) : (
                  <Box
                    key={index}
                    component="img"
                    src={url}
                    alt=""
                    sx={{
                      width: 120,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {answer?.comment && (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              bgcolor: "action.hover",
              borderLeft: `4px solid ${purple}`,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Uyga vazifa izohi:</Typography>
            <Typography sx={{ fontSize: 14, wordBreak: "break-word" }}>{answer.comment}</Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ ...panelPaperSx, p: 2.5 }}>
        <Alert severity="info" sx={{ mb: 2.5, fontSize: 13 }}>
          60–100 oralig&apos;ida ball qo&apos;yilgan vazifa &quot;Qabul qilingan&quot;, 0–59 oralig&apos;ida
          ball qo&apos;yilgan vazifa &quot;Qaytarilgan&quot; hisoblanadi.
        </Alert>

        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>Ball</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Slider
            value={grade}
            min={0}
            max={100}
            onChange={(_, value) => setGrade(value)}
            sx={{ flex: 1, color: green }}
          />
          <TextField
            type="number"
            value={grade}
            onChange={(event) => setGrade(Math.min(100, Math.max(0, Number(event.target.value) || 0)))}
            inputProps={{ min: 0, max: 100 }}
            sx={{ width: 72 }}
            size="small"
          />
        </Box>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
          O&apos;tish bali: 60 · Natija: {gradeToStatus(grade) === "ACCEPTED" ? "Qabul qilinadi" : "Qaytariladi"}
        </Typography>

        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>Izoh</Typography>
        <TextField
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Izohingiz"
          fullWidth
          multiline
          minRows={4}
          sx={{ mb: 2 }}
        />

        <Box
          component="label"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minHeight: 120,
            mb: 2,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "action.hover",
            cursor: "pointer",
          }}
        >
          <FiUploadCloud size={28} color={green} />
          <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", px: 2 }}>
            .jpg, .png, .pdf, .mp4 formatlarida fayl yuklash mumkin
          </Typography>
          <input hidden type="file" multiple />
        </Box>

        {errorMessage && (
          <Typography sx={{ color: "#ef4444", mb: 2, fontSize: 14 }}>{errorMessage}</Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/groups/${groupId}/homework/${homeworkId}/check`)}
            disabled={isSaving}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: green,
              color: "#fff",
              "&:hover": { bgcolor: "#1aa377" },
            }}
          >
            {isSaving ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function Meta({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
