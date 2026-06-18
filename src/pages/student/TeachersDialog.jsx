import {
  Box,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function TeachersDialog({ group, open, onClose }) {
  const teachers = group?.teachers || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 700, color: "text.primary" }}>
          {group?.name || "—"}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 18, color: "text.secondary" }}>
          {group?.isActive ? "Faol" : "Tugagan"}
        </Typography>

        <Box sx={{ mt: 2.5, borderRadius: "12px", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>O'qituvchi</TableCell>
                <TableCell sx={headCellSx}>Roli</TableCell>
                <TableCell sx={headCellSx}>Dars kunlari</TableCell>
                <TableCell sx={headCellSx}>Dars vaqti</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher, index) => (
                <TableRow key={`${teacher.name}-${index}`} sx={{ height: 62 }}>
                  <TableCell sx={bodyCellSx}>{teacher.name}</TableCell>
                  <TableCell sx={bodyCellSx}>{teacher.role}</TableCell>
                  <TableCell sx={bodyCellSx}>{teacher.days}</TableCell>
                  <TableCell sx={bodyCellSx}>{teacher.time}</TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    O'qituvchilar topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Dialog>
  );
}

const headCellSx = {
  color: "text.secondary",
  fontSize: 16,
  fontWeight: 700,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.6,
};

const bodyCellSx = {
  color: "text.primary",
  fontSize: 16,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 0,
};
