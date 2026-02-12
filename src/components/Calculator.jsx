import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator as CalcIcon, Save, RotateCcw, ChevronDown } from "lucide-react";
import { universities, getGradePoint } from "../data/universities";
import { useApp } from "../context/AppContext";
import CourseInput from "./CourseInput";

const Calculator = () => {
  const { activeProfile, addSemester, calculateSemesterGPA } = useApp();
  const [selectedUniversity, setSelectedUniversity] = useState(
    activeProfile?.university || ""
  );
  const [courses, setCourses] = useState([]);
  const [semesterName, setSemesterName] = useState("");
  const [gpa, setGpa] = useState(null);

  useEffect(() => {
    if (activeProfile?.university) {
      setSelectedUniversity(activeProfile.university);
    }
  }, [activeProfile]);

  const universityData = universities[selectedUniversity];

  const calculateGPA = () => {
    if (courses.length === 0) {
      setGpa(null);
      return;
    }

    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach((course) => {
      const credit = parseFloat(course.credit) || 0;
      const gradePoint = getGradePoint(selectedUniversity, course.grade);
      if (gradePoint !== null && credit > 0) {
        totalCredits += credit;
        totalPoints += credit * gradePoint;
      }
    });

    const calculatedGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setGpa(calculatedGpa.toFixed(2));
  };

  const handleSaveSemester = () => {
    if (!activeProfile || courses.length === 0 || !semesterName) return;
    
    addSemester({
      name: semesterName,
      courses: courses,
      gpa: gpa,
    });
    
    resetCalculator();
  };

  const resetCalculator = () => {
    setCourses([]);
    setSemesterName("");
    setGpa(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card calculator-card"
    >
      <div className="card-header">
        <CalcIcon size={20} />
        <h2>Calculate GPA</h2>
      </div>

      <div className="calculator-content">
        <div className="select-group">
          <label>Select University</label>
          <div className="select-wrapper">
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
                setCourses([]);
                setGpa(null);
              }}
            >
              <option value="">Choose your university</option>
              {Object.entries(universities).map(([key, uni]) => (
                <option key={key} value={key}>
                  {uni.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="select-icon" />
          </div>
        </div>

        <AnimatePresence>
          {selectedUniversity && universityData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grading-info">
                <h4>Grading Scale</h4>
                <div className="grade-chips">
                  {universityData.grades.slice(0, 6).map((g) => (
                    <span key={g.letter} className="grade-chip">
                      {g.letter}: {g.point}
                    </span>
                  ))}
                  {universityData.grades.length > 6 && (
                    <span className="grade-chip more">
                      +{universityData.grades.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {activeProfile && (
                <div className="input-group semester-name">
                  <label>Semester Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Fall 2024"
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                  />
                </div>
              )}

              <CourseInput
                courses={courses}
                setCourses={setCourses}
                grades={universityData.grades}
              />

              <div className="calculator-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                  onClick={calculateGPA}
                  disabled={courses.length === 0}
                >
                  <CalcIcon size={18} />
                  Calculate GPA
                </motion.button>

                {courses.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-secondary"
                    onClick={resetCalculator}
                  >
                    <RotateCcw size={18} />
                    Reset
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {gpa !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="result-card"
                  >
                    <div className="result-label">Your GPA</div>
                    <div className="result-value">{gpa}</div>
                    <div className="result-scale">out of {universityData.scale}</div>
                    
                    {activeProfile && semesterName && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-save"
                        onClick={handleSaveSemester}
                      >
                        <Save size={18} />
                        Save to Profile
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Calculator;
