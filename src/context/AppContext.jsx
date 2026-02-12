import { createContext, useContext, useState, useEffect } from "react";
import { universities, getGradePoint } from "../data/universities";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

const DEFAULT_PROFILE = {
  name: "",
  university: "",
  semesters: [],
  customGradingScale: null,
};

export const AppProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem("cgpa-profiles");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = localStorage.getItem("cgpa-active-profile");
    return saved || null;
  });

  const [currentSemester, setCurrentSemester] = useState({
    name: "Current Semester",
    courses: [],
  });

  useEffect(() => {
    localStorage.setItem("cgpa-profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem("cgpa-active-profile", activeProfileId);
    } else {
      localStorage.removeItem("cgpa-active-profile");
    }
  }, [activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  const createProfile = (name, university) => {
    const newProfile = {
      ...DEFAULT_PROFILE,
      id: Date.now().toString(),
      name,
      university,
      createdAt: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const updateProfile = (id, updates) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProfile = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles.length > 1 ? profiles[0].id : null);
    }
  };

  const addSemester = (semester) => {
    if (!activeProfile) return;
    const updatedSemesters = [...activeProfile.semesters, { ...semester, id: Date.now().toString() }];
    updateProfile(activeProfileId, { semesters: updatedSemesters });
  };

  const updateSemester = (semesterId, updates) => {
    if (!activeProfile) return;
    const updatedSemesters = activeProfile.semesters.map((s) =>
      s.id === semesterId ? { ...s, ...updates } : s
    );
    updateProfile(activeProfileId, { semesters: updatedSemesters });
  };

  const deleteSemester = (semesterId) => {
    if (!activeProfile) return;
    const updatedSemesters = activeProfile.semesters.filter((s) => s.id !== semesterId);
    updateProfile(activeProfileId, { semesters: updatedSemesters });
  };

  const calculateSemesterGPA = (courses, universityKey) => {
    if (!courses || courses.length === 0) return 0;
    
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach((course) => {
      const credit = parseFloat(course.credit) || 0;
      const gradePoint = getGradePoint(universityKey, course.grade);
      if (gradePoint !== null && credit > 0) {
        totalCredits += credit;
        totalPoints += credit * gradePoint;
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const calculateCGPA = () => {
    if (!activeProfile || activeProfile.semesters.length === 0) return 0;

    let totalCredits = 0;
    let totalPoints = 0;

    activeProfile.semesters.forEach((semester) => {
      semester.courses.forEach((course) => {
        const credit = parseFloat(course.credit) || 0;
        const gradePoint = getGradePoint(activeProfile.university, course.grade);
        if (gradePoint !== null && credit > 0) {
          totalCredits += credit;
          totalPoints += credit * gradePoint;
        }
      });
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const calculateCurrentSemesterGPA = (universityKey) => {
    return calculateSemesterGPA(currentSemester.courses, universityKey);
  };

  const setCustomGradingScale = (scale) => {
    if (!activeProfile) return;
    updateProfile(activeProfileId, { customGradingScale: scale });
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        setActiveProfileId,
        createProfile,
        updateProfile,
        deleteProfile,
        addSemester,
        updateSemester,
        deleteSemester,
        currentSemester,
        setCurrentSemester,
        calculateSemesterGPA,
        calculateCGPA,
        calculateCurrentSemesterGPA,
        setCustomGradingScale,
        universities,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
