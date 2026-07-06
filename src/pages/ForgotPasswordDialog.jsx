import { useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { FiArrowLeft, FiEye, FiEyeOff, FiX } from "react-icons/fi";

const API_ORIGIN = "https://najot-edu.softwareengineer.uz";

const recoveryClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "/api/v1" : `${API_ORIGIN}/api/v1`),
});

const EMAIL_API = import.meta.env.VITE_EMAIL_API || "https://najot-edu-email.onrender.com";
const emailClient = axios.create({ baseURL: `${EMAIL_API}/email` });

function normalizePhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 9) digits = `998${digits}`;
  return `+${digits}`;
}

function errText(error, fallback) {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  if (!error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error")) {
    return "Tarmoq xatosi. Internet yoki server ulanishini tekshiring.";
  }
  return message || fallback;
}

const steps = ["Kim ekanligingiz", "Tasdiqlash kodi", "Yangi parol"];

export default function ForgotPasswordDialog({ open, onClose, onDone }) {
  const [method, setMethod] = useState("sms");
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailTicket, setEmailTicket] = useState("");
  const [emailResetTicket, setEmailResetTicket] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setMethod("sms");
    setStep(0);
    setPhone("");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirm("");
    setEmailTicket("");
    setEmailResetTicket("");
    setShowPassword(false);
    setIsLoading(false);
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  const sendOtp = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (method === "email") {
        if (!email.trim().includes("@")) throw new Error("Email manzilni to'g'ri kiriting");
        const { data } = await emailClient.post("/send", { email: email.trim() });
        if (data && data.success === false) throw new Error(data.message);
        setEmailTicket(data.ticket);
      } else {
        if (String(phone).replace(/\D/g, "").length < 9) throw new Error("Telefon raqamni to'liq kiriting");
        const { data } = await recoveryClient.post("/auth/send-otp", { phone: normalizePhone(phone) });
        if (!data?.success) throw new Error(data?.message || "Kod yuborilmadi");
      }
      setSuccess(method === "email" ? "Tasdiqlash kodi emailingizga yuborildi" : "Tasdiqlash kodi telefoningizga yuborildi");
      setStep(1);
    } catch (e) {
      setError(e.message && !e.response ? e.message : errText(e, "Kod yuborishda xatolik"));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (otp.length < 4) {
      setError("Tasdiqlash kodini kiriting");
      return;
    }
    setIsLoading(true);
    try {
      if (method === "email") {
        const { data } = await emailClient.post("/verify", { ticket: emailTicket, otp });
        if (data && data.success === false) throw new Error(data.message);
        setEmailResetTicket(data.resetTicket);
      } else {
        const { data } = await recoveryClient.post("/auth/verify-otp", { phone: normalizePhone(phone), otp });
        if (data && data.success === false) throw new Error(data.message || "Kod noto'g'ri");
      }
      setSuccess("Kod tasdiqlandi");
      setStep(2);
    } catch (e) {
      setError(errText(e, "Kod noto'g'ri"));
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    setError("");
    if (password.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lsin");
      return;
    }
    if (password !== confirm) {
      setError("Parollar mos kelmadi");
      return;
    }
    setIsLoading(true);
    try {
      if (method === "email") {
        const { data } = await emailClient.post("/reset", { resetTicket: emailResetTicket, password });
        if (data && data.success === false) throw new Error(data.message);
      } else {
        const { data } = await recoveryClient.put("/auth/change-password", {
          phone: normalizePhone(phone),
          password,
        });
        if (data && data.success === false) throw new Error(data.message);
      }
      setSuccess("Parol muvaffaqiyatli o'zgartirildi");
      const loginPhone = method === "sms" ? normalizePhone(phone).replace("+", "") : undefined;
      setTimeout(() => {
        reset();
        onDone?.(loginPhone);
      }, 1100);
    } catch (e) {
      setError(errText(e, "Parolni o'zgartirishda xatolik"));
      setIsLoading(false);
    }
  };

  const back = () => {
    setError("");
    setSuccess("");
    setStep((value) => Math.max(0, value - 1));
  };

  const submit = () => {
    if (step === 0) return sendOtp();
    if (step === 1) return verifyOtp();
    return changePassword();
  };

  const buttonLabel = step === 0 ? "Kod yuborish" : step === 1 ? "Tasdiqlash" : "Parolni o'zgartirish";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
    >
      <DialogContent sx={{ p: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {step > 0 && (
              <IconButton size="small" onClick={back} disabled={isLoading} sx={{ color: "text.primary" }}>
                <FiArrowLeft size={18} />
              </IconButton>
            )}
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}>
              Parolni tiklash
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={isLoading} sx={{ color: "text.secondary" }}>
            <FiX size={18} />
          </IconButton>
        </Box>

        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 2.5 }}>
          {step + 1}/3 — {steps[step]}
        </Typography>

        {step === 0 && (
          <>
            <Box sx={{ display: "flex", gap: 1, mb: 2.2 }}>
              <MethodButton active={method === "sms"} onClick={() => setMethod("sms")} label="Telefon (SMS)" />
              <MethodButton active={method === "email"} onClick={() => setMethod("email")} label="Email" />
            </Box>
            {method === "email" ? (
              <TextField
                label="Email"
                placeholder="example@gmail.com"
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                InputLabelProps={{ shrink: true }}
                sx={fieldStyles}
              />
            ) : (
              <TextField
                label="Telefon"
                placeholder="998 90 123 45 67"
                fullWidth
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                InputLabelProps={{ shrink: true }}
                sx={fieldStyles}
              />
            )}
          </>
        )}

        {step === 1 && (
          <TextField
            label="Tasdiqlash kodi"
            placeholder="Kodni kiriting"
            fullWidth
            size="small"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            inputProps={{ inputMode: "numeric" }}
            InputLabelProps={{ shrink: true }}
            sx={fieldStyles}
          />
        )}

        {step === 2 && (
          <>
            <TextField
              label="Yangi parol"
              placeholder="Yangi parol"
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((v) => !v)} sx={{ color: "text.secondary" }}>
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 1.5, py: 0.2 }}>
            {error}
          </Alert>
        )}
        {success && !error && (
          <Alert severity="success" sx={{ mb: 1.5, py: 0.2 }}>
            {success}
          </Alert>
        )}

        {step === 1 && (
          <Typography
            onClick={() => !isLoading && sendOtp()}
            sx={{
              fontSize: 12,
              color: "text.primary",
              fontWeight: 600,
              cursor: isLoading ? "default" : "pointer",
              mb: 1.5,
              "&:hover": { textDecoration: isLoading ? "none" : "underline" },
            }}
          >
            Kodni qayta yuborish
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={submit}
          disabled={isLoading}
          sx={{
            height: 40,
            borderRadius: "6px",
            bgcolor: "#223061",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#1b2754" },
          }}
        >
          {isLoading ? "Yuborilmoqda..." : buttonLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function MethodButton({ active, onClick, label }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      sx={{
        flex: 1,
        textAlign: "center",
        py: 1,
        borderRadius: "8px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        border: "1px solid",
        borderColor: active ? "#223061" : "divider",
        bgcolor: active ? "#223061" : "transparent",
        color: active ? "#fff" : "text.secondary",
      }}
    >
      {label}
    </Box>
  );
}

const fieldStyles = {
  mb: 2,
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    mb: 0.7,
    fontSize: 11,
    color: "text.primary",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "text.primary" },
  "& .MuiOutlinedInput-root": {
    height: 41,
    borderRadius: "4px",
    fontSize: 12,
    bgcolor: "background.paper",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "divider" },
    "&.Mui-focused fieldset": { borderWidth: 1, borderColor: "#223061" },
  },
  "& .MuiOutlinedInput-input": {
    px: 1.8,
    "&::placeholder": { color: "text.secondary", opacity: 1 },
  },
};
