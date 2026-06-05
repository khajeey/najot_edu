import { api } from "../../api/axiosClient";
import { fetchGroupStudents } from "./lessonApi";

export const HOMEWORK_RESULT_STATUS = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  ACCEPTED: "ACCEPTED",
  NOT_DONE: "NOT_DONE",
};

export const HOMEWORK_TABS = [
  { key: "PENDING", label: "Kutayotganlar" },
  { key: "REJECTED", label: "Qaytarilganlar" },
  { key: "ACCEPTED", label: "Qabul qilinganlar" },
  { key: "NOT_DONE", label: "Bajarilmagan" },
];

function normalizeFile(file) {
  if (!file) return null;
  if (typeof file === "string") return { path: file };

  return {
    path: file.path || file.url || file.file || file.filename || file.name,
    type: file.type || file.mime_type,
  };
}

export function normalizeHomeworkResult(item) {
  const student = item.student || item.Student || {};
  const hasExplicitStatus = Boolean(item.status || item.homework_status);
  const hasSubmission = Boolean(
    item.homework_answer_id
    || item.submitted_at
    || item.sent_at
    || item.files?.length
    || item.attachments?.length
  );

  let status = HOMEWORK_RESULT_STATUS.NOT_DONE;

  if (hasExplicitStatus) {
    status = String(item.status || item.homework_status).toUpperCase();
  } else if (hasSubmission) {
    const grade = item.grade ?? item.ball ?? item.score;
    if (grade != null) {
      status = Number(grade) >= 60 ? HOMEWORK_RESULT_STATUS.ACCEPTED : HOMEWORK_RESULT_STATUS.REJECTED;
    } else {
      status = HOMEWORK_RESULT_STATUS.PENDING;
    }
  }

  const studentId = item.student_id ?? student.id ?? item.id;
  const homeworkAnswerId = item.homework_answer_id ?? (hasSubmission ? item.id : null) ?? studentId;

  return {
    id: homeworkAnswerId ?? studentId,
    homeworkAnswerId,
    studentId,
    studentName:
      item.student_name
      || student.full_name
      || student.name
      || item.full_name
      || "—",
    submittedAt: item.submitted_at || item.created_at || item.sent_at || null,
    status,
    grade: item.grade ?? item.ball ?? item.score ?? null,
    comment: item.comment || item.description || item.answer_comment || item.title || "",
    files: (item.files || item.File || item.attachments || [])
      .map(normalizeFile)
      .filter(Boolean),
    canGrade: Boolean(status !== HOMEWORK_RESULT_STATUS.NOT_DONE),
  };
}

export async function fetchHomeworkResultsRaw(groupId, homeworkId, status) {
  const params = status ? { status } : undefined;
  const { data } = await api.get(`/group/${groupId}/homework/${homeworkId}/results`, { params });

  if (data?.success === false) {
    throw new Error(data.message || "Natijalarni yuklashda xatolik");
  }

  let list = [];
  if (data?.data?.students && Array.isArray(data.data.students)) {
    list = data.data.students;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data)) {
    list = data;
  }
  return list.map(normalizeHomeworkResult);
}

export async function fetchHomeworkResults(groupId, homeworkId, status) {
  // Fetch group students and results for PENDING, ACCEPTED, and REJECTED in parallel
  const [groupStudents, pendingRes, acceptedRes, rejectedRes] = await Promise.all([
    fetchGroupStudents(groupId).catch(() => []),
    fetchHomeworkResultsRaw(groupId, homeworkId, "PENDING").catch(() => []),
    fetchHomeworkResultsRaw(groupId, homeworkId, "ACCEPTED").catch(() => []),
    fetchHomeworkResultsRaw(groupId, homeworkId, "REJECTED").catch(() => []),
  ]);

  const submissionsMap = new Map();
  pendingRes.forEach((item) => {
    if (item.studentId) submissionsMap.set(Number(item.studentId), item);
  });
  acceptedRes.forEach((item) => {
    if (item.studentId) submissionsMap.set(Number(item.studentId), item);
  });
  rejectedRes.forEach((item) => {
    if (item.studentId) submissionsMap.set(Number(item.studentId), item);
  });

  const allResults = groupStudents.map((student) => {
    const submission = submissionsMap.get(Number(student.id));
    if (submission) {
      return {
        ...submission,
        studentName: student.name,
      };
    }
    return {
      id: `not_done_${student.id}`,
      homeworkAnswerId: null,
      studentId: student.id,
      studentName: student.name,
      submittedAt: null,
      status: HOMEWORK_RESULT_STATUS.NOT_DONE,
      grade: null,
      comment: "",
      files: [],
      canGrade: false,
    };
  });

  const groupStudentIds = new Set(groupStudents.map((s) => Number(s.id)));
  const extraSubmissions = [];
  const addExtra = (item) => {
    if (item.studentId && !groupStudentIds.has(Number(item.studentId))) {
      extraSubmissions.push(item);
    }
  };
  pendingRes.forEach(addExtra);
  acceptedRes.forEach(addExtra);
  rejectedRes.forEach(addExtra);

  const finalAll = [...allResults, ...extraSubmissions];

  if (status) {
    return finalAll.filter((item) => item.status === status);
  }
  return finalAll;
}

export async function fetchHomeworkResultsWithCounts(groupId, homeworkId) {
  const all = await fetchHomeworkResults(groupId, homeworkId);

  const counts = {
    PENDING: 0,
    REJECTED: 0,
    ACCEPTED: 0,
    NOT_DONE: 0,
  };

  all.forEach((item) => {
    const key = HOMEWORK_TABS.find((tab) => tab.key === item.status)?.key || HOMEWORK_RESULT_STATUS.NOT_DONE;
    counts[key] = (counts[key] || 0) + 1;
  });

  return { all, counts };
}

export async function checkHomeworkAnswer(groupId, homeworkId, payload) {
  const grade = Number(payload.grade);
  const body = {
    grade,
    title: payload.title || "",
    homework_answer_id: Number(payload.homework_answer_id),
  };

  const { data } = await api.post(`/group/${groupId}/homework/${homeworkId}/check`, body);

  if (data?.success === false) {
    throw new Error(data.message || "Baholashda xatolik");
  }

  return data?.data ?? data;
}

export function gradeToStatus(grade) {
  return Number(grade) >= 60 ? HOMEWORK_RESULT_STATUS.ACCEPTED : HOMEWORK_RESULT_STATUS.REJECTED;
}

export async function fetchHomeworkMeta(groupId, homeworkId) {
  const { data } = await api.get(`/homework/${groupId}`);
  if (!data?.success) return null;

  for (const lesson of data.data || []) {
    const homeworkList = Array.isArray(lesson.homework) ? lesson.homework : [];
    const match = homeworkList.find((hw) => Number(hw.id) === Number(homeworkId));

    if (match) {
      return {
        lessonId: lesson.id,
        topic: lesson.topic || "—",
        homeworkId: match.id,
        createdAt: match.created_at,
        endsAt: match.end_at || match.deadline,
      };
    }
  }

  return null;
}
