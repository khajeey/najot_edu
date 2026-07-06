import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FiMoreVertical, FiPlay, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { getApiErrorMessage } from "../../api/axiosClient";
import { purple } from "./constants";
import {
  fetchGroupVideos,
  formatFileSize,
  formatVideoDate,
  uploadGroupVideo,
} from "./filesApi";
import { fetchLessonTopics } from "./lessonApi";

const green = "#20b486";
const allowedFormats = ".mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov";

export default function GroupVideosTab({ groupId, openUpload, onUploadClosed }) {
  const [videos, setVideos] = useState([]);
  const [lessonOptions, setLessonOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadItems, setUploadItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  const loadVideos = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const list = await fetchGroupVideos(groupId);
      setVideos(list);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Videolarni yuklashda xatolik"));
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
    fetchLessonTopics(groupId).then(setLessonOptions);
  }, [groupId]);

  useEffect(() => {
    if (openUpload) {
      setUploadOpen(true);
    }
  }, [openUpload]);

  const handleFilesSelected = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploadItems(
      files.map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        lessonId: "",
        title: file.name,
      }))
    );
    setUploadOpen(true);
  };

  const updateUploadItem = (id, field, value) => {
    setUploadItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeUploadItem = (id) => {
    setUploadItems((current) => current.filter((item) => item.id !== id));
  };

  const handleUpload = async () => {
    const invalid = uploadItems.some((item) => !item.lessonId || !item.title.trim());
    if (invalid) {
      setErrorMessage("Har bir video uchun dars va nom tanlang");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      for (const item of uploadItems) {
        await uploadGroupVideo({
          groupId,
          lessonId: item.lessonId,
          file: item.file,
          title: item.title.trim(),
        });
      }

      setUploadOpen(false);
      setUploadItems([]);
      onUploadClosed?.();
      await loadVideos();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Videoni yuklashda xatolik"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
        <Table sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={headCellStyles}>#</TableCell>
              <TableCell sx={headCellStyles}>Video nomi</TableCell>
              <TableCell sx={headCellStyles}>Dars nomi</TableCell>
              <TableCell sx={headCellStyles}>Status</TableCell>
              <TableCell sx={headCellStyles}>Dars sanasi</TableCell>
              <TableCell sx={headCellStyles}>Hajmi</TableCell>
              <TableCell sx={headCellStyles}>Qo'shilgan vaqti</TableCell>
              <TableCell align="right" sx={headCellStyles}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow key={video.id} sx={{ height: 58 }}>
                <TableCell sx={bodyCellStyles}>{index + 1}</TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box
                    onClick={() => video.playUrl && setPlayingVideo(video)}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: video.playUrl ? "pointer" : "default",
                      color: "#2563eb",
                      fontWeight: 700,
                      "&:hover": video.playUrl ? { textDecoration: "underline" } : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiPlay size={14} color="#2563eb" />
                    </Box>
                    {video.name}
                  </Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>{video.lessonName}</TableCell>
                <TableCell sx={bodyCellStyles}>
                  <Box sx={statusBadgeStyles}>{video.status}</Box>
                </TableCell>
                <TableCell sx={bodyCellStyles}>{formatVideoDate(video.lessonDate)}</TableCell>
                <TableCell sx={bodyCellStyles}>{formatFileSize(video.size)}</TableCell>
                <TableCell sx={bodyCellStyles}>{formatVideoDate(video.createdAt)}</TableCell>
                <TableCell align="right" sx={bodyCellStyles}>
                  <IconButton sx={{ color: "text.secondary" }}>
                    <FiMoreVertical size={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} sx={{ color: purple }} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && errorMessage && !uploadOpen && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#ef4444" }}>
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !errorMessage && videos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  Videolar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <UploadDialog
        open={uploadOpen}
        items={uploadItems}
        lessonOptions={lessonOptions}
        isUploading={isUploading}
        errorMessage={errorMessage}
        onClose={() => {
          setUploadOpen(false);
          setUploadItems([]);
          setErrorMessage("");
          onUploadClosed?.();
        }}
        onFilesSelected={handleFilesSelected}
        onUpdateItem={updateUploadItem}
        onRemoveItem={removeUploadItem}
        onUpload={handleUpload}
      />

      <VideoPlayerDialog video={playingVideo} onClose={() => setPlayingVideo(null)} />
    </Box>
  );
}

function UploadDialog({
  open,
  items,
  lessonOptions,
  isUploading,
  errorMessage,
  onClose,
  onFilesSelected,
  onUpdateItem,
  onRemoveItem,
  onUpload,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
        Qo'shish
        <IconButton onClick={onClose}>
          <FiX />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          component="label"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minHeight: 160,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "action.hover",
            cursor: "pointer",
            px: 2,
            textAlign: "center",
            "&:hover": { bgcolor: "#f5fbf8", borderColor: green },
          }}
        >
          <FiUploadCloud size={36} color={green} />
          <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
            Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Videofayl: {allowedFormats} formatlaridan birida bo'lishi kerak
          </Typography>
          <input
            hidden
            type="file"
            multiple
            accept={allowedFormats.replace(/\s/g, "")}
            onChange={(event) => onFilesSelected(event.target.files)}
          />
        </Box>

        {items.length > 0 && (
          <Table sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={dialogHeadStyles}>File name</TableCell>
                <TableCell sx={dialogHeadStyles}>* Dars</TableCell>
                <TableCell sx={dialogHeadStyles}>* Video nomi</TableCell>
                <TableCell align="right" sx={dialogHeadStyles}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={dialogBodyStyles}>{item.file.name}</TableCell>
                  <TableCell sx={dialogBodyStyles}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={item.lessonId}
                        displayEmpty
                        onChange={(event) => onUpdateItem(item.id, "lessonId", event.target.value)}
                        sx={selectStyles}
                      >
                        <MenuItem value="" disabled>
                          Darsni tanlang
                        </MenuItem>
                        {lessonOptions.map((lesson) => (
                          <MenuItem key={lesson.id} value={String(lesson.id)}>
                            {lesson.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={dialogBodyStyles}>
                    <TextField
                      size="small"
                      fullWidth
                      value={item.title}
                      onChange={(event) => onUpdateItem(item.id, "title", event.target.value)}
                    />
                  </TableCell>
                  <TableCell align="right" sx={dialogBodyStyles}>
                    <IconButton onClick={() => onRemoveItem(item.id)} sx={{ color: "#ef4444" }}>
                      <FiTrash2 />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {errorMessage && (
          <Typography sx={{ mt: 2, color: "#ef4444", fontWeight: 600 }}>{errorMessage}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: "text.secondary" }}>
          Bekor qilish
        </Button>
        <Button
          onClick={onUpload}
          disabled={isUploading || items.length === 0}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: green,
            color: "#fff",
            px: 2.5,
            "&:hover": { bgcolor: "#1aa377" },
          }}
        >
          {isUploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function VideoPlayerDialog({ video, onClose }) {
  return (
    <Dialog open={Boolean(video)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {video?.name || "Video"}
        <IconButton onClick={onClose}>
          <FiX />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {video?.playUrl ? (
          <Box
            component="video"
            src={video.playUrl}
            controls
            autoPlay
            sx={{ width: "100%", borderRadius: "10px", bgcolor: "#000" }}
          />
        ) : (
          <Typography sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
            Video manzili topilmadi
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

const headCellStyles = {
  color: "text.secondary",
  fontSize: 14,
  fontWeight: 700,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.5,
};

const bodyCellStyles = {
  color: "text.primary",
  fontSize: 14,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.2,
};

const statusBadgeStyles = {
  display: "inline-flex",
  px: 1.2,
  py: 0.3,
  borderRadius: "999px",
  bgcolor: "#e8f7e9",
  color: green,
  fontWeight: 700,
  fontSize: 13,
};

const dialogHeadStyles = {
  fontWeight: 700,
  color: "text.secondary",
  fontSize: 13,
};

const dialogBodyStyles = {
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.2,
};

const selectStyles = {
  borderRadius: "8px",
  fontSize: 14,
};
