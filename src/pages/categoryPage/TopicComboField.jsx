import { Autocomplete, TextField } from "@mui/material";
import { purple } from "./constants";

export default function TopicComboField({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = "Mavzuni kiriting yoki tanlang",
}) {
  const selectedOption = options.find((option) => option.id === value?.lessonId) || null;
  const inputValue = value?.customTopic ?? selectedOption?.label ?? "";

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      onChange={(_, option) => {
        if (typeof option === "string") {
          onChange({ lessonId: null, customTopic: option });
          return;
        }

        if (option?.id) {
          onChange({ lessonId: option.id, customTopic: option.label });
          return;
        }

        onChange({ lessonId: null, customTopic: "" });
      }}
      onInputChange={(_, text, reason) => {
        if (reason === "input") {
          const matched = options.find((option) => option.label === text);
          onChange({
            lessonId: matched?.id ?? null,
            customTopic: text,
          });
        }
      }}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 15,
              "& fieldset": { borderColor: "#dce2eb" },
              "&.Mui-focused fieldset": { borderColor: purple, borderWidth: 1 },
            },
          }}
        />
      )}
    />
  );
}
