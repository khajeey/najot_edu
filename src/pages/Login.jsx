import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import tatuLogo from "../assets/tatu.png";
import { api, getApiErrorMessage } from "../api/axiosClient";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    phone: "998975661099",
    password: "Benazir99!",
  });
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setShowAlert(false);

    try {
      const { data } = await api.post("/auth/login", form);

      if (!data.success) {
        throw new Error(data.message || "Login bajarilmadi");
      }

      localStorage.setItem("accessToken", data.accessToken);
      setAlertSeverity("success");
      setAlertMessage(data.message || "Login muvaffaqiyatli bajarildi");
      setShowAlert(true);

      timerRef.current = setTimeout(() => {
        setShowAlert(false);
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setAlertSeverity("error");
      setAlertMessage(getApiErrorMessage(error, "Server bilan bog'lanishda xatolik"));
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white md:grid md:grid-cols-2">
      <section className="flex min-h-[340px] items-center justify-center bg-[#223061] px-6 py-10 md:min-h-screen lg:px-16">
        <img
          src="/study.svg"
          alt="Talaba dars qilmoqda"
          className="block w-full max-w-[690px]"
        />
      </section>

      <section className="relative flex min-h-[calc(100vh-340px)] items-center justify-center px-6 py-16 md:min-h-screen">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 345,
          }}
        >
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: 9,
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#2c303b",
              }}
            >
              MUHAMMAD AL-XORAZMIY NOMIDAGI
              <br />
              TOSHKENT AXBOROT TEXNOLOGIYALARI
              <br />
              UNIVERSITETI
            </Typography>

            <Box
              component="img"
              src={tatuLogo}
              alt="TATU logo"
              sx={{
                display: "block",
                width: 72,
                height: 72,
                objectFit: "contain",
                mx: "auto",
                mt: 1.3,
              }}
            />
          </Box>

          <Typography
            component="h1"
            sx={{
              mb: 2.7,
              textAlign: "center",
              fontSize: 17,
              fontWeight: 700,
              color: "#252936",
            }}
          >
            LEARNING MANAGEMENT SYSTEM
          </Typography>

          <TextField
            label="Telefon"
            placeholder="Telefon raqamni kiriting"
            variant="outlined"
            fullWidth
            size="small"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldStyles}
          />

          <TextField
            label="Parol"
            placeholder="Parolni kiriting"
            variant="outlined"
            fullWidth
            size="small"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            type={showPassword ? "text" : "password"}
            InputLabelProps={{ shrink: true }}
            sx={fieldStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    onClick={() => setShowPassword((value) => !value)}
                    sx={{ color: "#6f7480" }}
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disableElevation
            fullWidth
            disabled={isLoading}
            sx={{
              height: 38,
              mt: 0.5,
              borderRadius: "4px",
              bgcolor: "#223061",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#1b2754",
              },
            }}
          >
            {isLoading ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </Box>

        <Typography
          sx={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 24,
            textAlign: "center",
            fontSize: 11,
            color: "#202431",
          }}
        >
          Copyright (c) 2021 of Tashkent University of Information Technologies
        </Typography>

        <Snackbar
          open={showAlert}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={alertSeverity} variant="filled" sx={{ width: "100%" }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </section>
    </main>
  );
}

const fieldStyles = {
  mb: 2,
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    mb: 0.8,
    fontSize: 11,
    color: "#222633",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#222633",
  },
  "& .MuiOutlinedInput-root": {
    height: 41,
    borderRadius: "2px",
    fontSize: 12,
    bgcolor: "#fff",
    "& fieldset": {
      borderColor: "#cfcfcf",
    },
    "&:hover fieldset": {
      borderColor: "#b8b8b8",
    },
    "&.Mui-focused fieldset": {
      borderWidth: 1,
      borderColor: "#223061",
    },
  },
  "& .MuiOutlinedInput-input": {
    px: 1.8,
    py: 0,
    "&::placeholder": {
      color: "#8d8d8d",
      opacity: 1,
    },
  },
};
