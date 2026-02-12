import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, BookOpen, Check } from "lucide-react";

const CourseInput = ({ courses, setCourses, grades }) => {
  const [newCourse, setNewCourse] = useState({
    name: "",
    credit: "",
    grade: "",
  });

  const canAdd = newCourse.name && newCourse.credit && newCourse.grade;

  const addCourse = () => {
    if (canAdd) {
      setCourses([...courses, { ...newCourse, id: Date.now() }]);
      setNewCourse({ name: "", credit: "", grade: "" });
    }
  };

  const removeCourse = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addCourse();
    }
  };

  return (
    <div className="course-input-section">
      <h4 className="section-title">Add Courses</h4>
      <div className="input-row">
        <div className="input-group">
          <label>Course Name</label>
          <input
            type="text"
            placeholder="e.g., Calculus I"
            value={newCourse.name}
            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="input-group small">
          <label>Credits</label>
          <input
            type="number"
            placeholder="3"
            min="0.5"
            max="6"
            step="0.5"
            value={newCourse.credit}
            onChange={(e) => setNewCourse({ ...newCourse, credit: e.target.value })}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="input-group">
          <label>Grade</label>
          <select
            value={newCourse.grade}
            onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
          >
            <option value="">Select Grade</option>
            {grades.map((g) => (
              <option key={g.letter} value={g.letter}>
                {g.letter} ({g.point})
              </option>
            ))}
          </select>
        </div>
        <motion.button
          whileHover={canAdd ? { scale: 1.08 } : {}}
          whileTap={canAdd ? { scale: 0.95 } : {}}
          animate={canAdd ? { 
            boxShadow: ["0 0 0 0 rgba(249, 115, 22, 0)", "0 0 0 8px rgba(249, 115, 22, 0.3)", "0 0 0 0 rgba(249, 115, 22, 0)"]
          } : {}}
          transition={canAdd ? { 
            boxShadow: { duration: 1.5, repeat: Infinity }
          } : {}}
          className={`btn add-btn ${canAdd ? "btn-add-ready" : "btn-add-disabled"}`}
          onClick={addCourse}
          disabled={!canAdd}
        >
          {canAdd ? <Check size={20} /> : <Plus size={20} />}
          <span className="add-btn-text">{canAdd ? "Add" : "Add"}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="courses-list"
          >
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="course-item"
              >
                <div className="course-icon">
                  <BookOpen size={16} />
                </div>
                <div className="course-details">
                  <span className="course-name">{course.name}</span>
                  <span className="course-meta">
                    {course.credit} credits • Grade: {course.grade}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="remove-btn"
                  onClick={() => removeCourse(course.id)}
                >
                  <X size={16} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseInput;
