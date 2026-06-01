/** Kartalar va panel uchun tungi/yorug' rejimga mos fon */
export function mutedCardSx(theme) {
  return {
    bgcolor: theme.palette.mode === "dark" ? "#1a2438" : "#f3f5fa",
    border: "1px solid",
    borderColor: "divider",
  };
}

export const pageTitleSx = {
  fontSize: { xs: 20, md: 22 },
  fontWeight: 700,
  color: "text.primary",
  lineHeight: 1.2,
};

export const sectionTitleSx = {
  fontSize: 18,
  fontWeight: 700,
  color: "text.primary",
};

export const panelPaperSx = {
  borderRadius: "12px",
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  overflow: "hidden",
};
