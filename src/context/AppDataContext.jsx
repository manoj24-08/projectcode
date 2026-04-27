import { createContext, useContext, useState, useCallback } from 'react';
import {
  mockCourses,
  mockMaterials,
  mockAssignments,
  mockSubmissions,
  mockStudentProgress,
} from '../data/mockData';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [courses, setCourses] = useState(mockCourses);
  const [materials, setMaterials] = useState(mockMaterials);
  const [assignments, setAssignments] = useState(mockAssignments);
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [progress, setProgress] = useState(mockStudentProgress);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Courses
  const createCourse = useCallback((data) => {
    const newCourse = {
      ...data,
      id: Date.now(),
      students: 0,
      rating: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      modules: [],
    };
    setCourses((prev) => [...prev, newCourse]);
    showToast('Course created successfully!');
    return newCourse;
  }, [showToast]);

  const updateCourse = useCallback((id, data) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    showToast('Course updated successfully!');
  }, [showToast]);

  const deleteCourse = useCallback((id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    showToast('Course deleted.', 'info');
  }, [showToast]);

  const publishCourse = useCallback((id) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c))
    );
    showToast('Course status updated!');
  }, [showToast]);

  // Materials
  const addMaterial = useCallback((material) => {
    const newMat = { ...material, id: Date.now(), uploadedAt: new Date().toISOString().split('T')[0] };
    setMaterials((prev) => [...prev, newMat]);
    showToast('Material uploaded successfully!');
    return newMat;
  }, [showToast]);

  const deleteMaterial = useCallback((id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Material removed.', 'info');
  }, [showToast]);

  // Assignments
  const createAssignment = useCallback((data) => {
    const newAssignment = {
      ...data,
      id: Date.now(),
      submissions: 0,
      status: 'active',
    };
    setAssignments((prev) => [...prev, newAssignment]);
    showToast('Assignment created!');
    return newAssignment;
  }, [showToast]);

  const deleteAssignment = useCallback((id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    showToast('Assignment deleted.', 'info');
  }, [showToast]);

  // Submissions
  const submitAssignment = useCallback((data) => {
    const existing = submissions.find(
      (s) => s.assignmentId === data.assignmentId && s.studentId === data.studentId
    );
    if (existing) {
      showToast('You have already submitted this assignment.', 'error');
      return null;
    }
    const newSub = {
      ...data,
      id: Date.now(),
      submittedAt: new Date().toISOString().split('T')[0],
      score: null,
      feedback: null,
      status: 'submitted',
    };
    setSubmissions((prev) => [...prev, newSub]);
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === data.assignmentId ? { ...a, submissions: a.submissions + 1 } : a
      )
    );
    showToast('Assignment submitted successfully!');
    return newSub;
  }, [submissions, showToast]);

  // Enrollment
  const enrollCourse = useCallback((studentId, courseId) => {
    setProgress((prev) => {
      const exists = prev.find((p) => p.studentId === studentId && p.courseId === courseId);
      if (exists) return prev;
      return [
        ...prev,
        {
          studentId,
          courseId,
          progress: 0,
          completedLessons: 0,
          totalLessons: 20,
          lastAccessed: new Date().toISOString().split('T')[0],
          timeSpent: '0h 0m',
          grade: '-',
        },
      ];
    });
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, students: c.students + 1 } : c))
    );
    showToast('Enrolled successfully!');
  }, [showToast]);

  const updateProgress = useCallback((studentId, courseId, lessonsDone) => {
    setProgress((prev) =>
      prev.map((p) => {
        if (p.studentId === studentId && p.courseId === courseId) {
          const newProgress = Math.min(100, Math.round((lessonsDone / p.totalLessons) * 100));
          return { ...p, completedLessons: lessonsDone, progress: newProgress, lastAccessed: new Date().toISOString().split('T')[0] };
        }
        return p;
      })
    );
  }, []);

  const getStudentProgress = useCallback(
    (studentId) => progress.filter((p) => p.studentId === studentId),
    [progress]
  );

  const getCourseProgress = useCallback(
    (studentId, courseId) =>
      progress.find((p) => p.studentId === studentId && p.courseId === courseId),
    [progress]
  );

  const isEnrolled = useCallback(
    (studentId, courseId) =>
      progress.some((p) => p.studentId === studentId && p.courseId === courseId),
    [progress]
  );

  return (
    <AppDataContext.Provider
      value={{
        courses,
        materials,
        assignments,
        submissions,
        progress,
        toast,
        showToast,
        createCourse,
        updateCourse,
        deleteCourse,
        publishCourse,
        addMaterial,
        deleteMaterial,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        enrollCourse,
        updateProgress,
        getStudentProgress,
        getCourseProgress,
        isEnrolled,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
