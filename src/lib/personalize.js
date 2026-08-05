// src/lib/personalize.js
import { base44 } from "@/api/base44Client";
import { getActiveStudentId } from "@/lib/rewardSystem";

/**
 * Resolves the student name following priority:
 * 1. student.nickname
 * 2. student.display_name
 * 3. student.name / student.full_name
 * 4. user.full_name (LAST FALLBACK ONLY if not in child mode)
 *
 * Prevents parent/admin name from being used when child mode is active.
 */
export const resolveStudentName = (studentData, currentUser = null) => {
  // Check if active child session exists in localStorage
  let activeChildObj = null;
  try {
    const cachedStr = localStorage.getItem("active_child");
    if (cachedStr) {
      activeChildObj = JSON.parse(cachedStr);
    }
  } catch {}

  const isChildMode = !!(
    localStorage.getItem("active_child_session") ||
    localStorage.getItem("selected_child_id") ||
    localStorage.getItem("active_student_id") ||
    activeChildObj
  );

  const activeStudentName = localStorage.getItem("active_student_name");

  // Determine candidate student object
  let s = null;
  if (studentData && typeof studentData === "object") {
    s = studentData;
  } else if (activeChildObj && typeof activeChildObj === "object") {
    s = activeChildObj;
  }

  // Check 1: student.nickname
  if (s?.nickname && String(s.nickname).trim()) {
    return String(s.nickname).trim();
  }
  if (activeChildObj?.nickname && String(activeChildObj.nickname).trim()) {
    return String(activeChildObj.nickname).trim();
  }

  // Check 2: student.display_name
  if (s?.display_name && String(s.display_name).trim()) {
    return String(s.display_name).trim();
  }
  if (activeChildObj?.display_name && String(activeChildObj.display_name).trim()) {
    return String(activeChildObj.display_name).trim();
  }

  // Check 3: student.name or student.full_name
  if (s?.name && String(s.name).trim()) {
    return String(s.name).trim().split(/\s+/)[0];
  }
  if (s?.full_name && String(s.full_name).trim()) {
    return String(s.full_name).trim().split(/\s+/)[0];
  }
  if (activeChildObj?.name && String(activeChildObj.name).trim()) {
    return String(activeChildObj.name).trim().split(/\s+/)[0];
  }
  if (activeChildObj?.full_name && String(activeChildObj.full_name).trim()) {
    return String(activeChildObj.full_name).trim().split(/\s+/)[0];
  }
  if (activeStudentName && String(activeStudentName).trim()) {
    return String(activeStudentName).trim().split(/\s+/)[0];
  }

  // If studentData is passed directly as a string name
  if (typeof studentData === "string" && studentData.trim()) {
    const stringVal = studentData.trim();
    if (!isChildMode || !currentUser?.full_name || stringVal !== currentUser.full_name) {
      return stringVal;
    }
  }

  // Check 4: user.full_name (LAST FALLBACK ONLY if not in child mode)
  if (currentUser) {
    if (currentUser.nickname && String(currentUser.nickname).trim()) {
      return String(currentUser.nickname).trim();
    }
    if (currentUser.display_name && String(currentUser.display_name).trim()) {
      return String(currentUser.display_name).trim();
    }
    if (!isChildMode || currentUser.app_role !== "parent") {
      if (currentUser.full_name && String(currentUser.full_name).trim()) {
        return String(currentUser.full_name).trim().split(/\s+/)[0];
      }
    }
  }

  return "Pengembara";
};

/**
 * Replace {{nama}}, {{nickname}}, {{student_name}}, {{studentName}}, {{nama_pelajar}}
 * placeholders with the student's display name.
 * Safe no-op when text has no placeholder.
 */
export const personalize = (text, studentDataOrName = "Pengembara", currentUser = null) => {
  if (!text) return "";
  const name = resolveStudentName(studentDataOrName, currentUser);
  return String(text).replace(/\{{1,2}\s*(nama|nickname|student_name|studentName|nama_pelajar)\s*\}{1,2}/gi, name);
};

export const replaceStudentVariables = personalize;

/**
 * Resolve the active student's display name: nickname > first name from full_name > "".
 * Works for both child logins and parent view mode.
 */
export const getStudentDisplayName = async () => {
  try {
    const studentId = await getActiveStudentId();
    if (!studentId) return "Pengembara";

    const cachedStr = localStorage.getItem("active_child");
    if (cachedStr) {
      try {
        const childObj = JSON.parse(cachedStr);
        if (childObj && (childObj.id === studentId || childObj._id === studentId)) {
          return resolveStudentName(childObj);
        }
      } catch {}
    }

    const user = await base44.entities.User.get(studentId);
    if (user) {
      return resolveStudentName(user);
    }
    return "Pengembara";
  } catch {
    return "Pengembara";
  }
};

