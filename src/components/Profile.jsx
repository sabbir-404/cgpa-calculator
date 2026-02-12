import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Plus,
  Trash2,
  ChevronDown,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  X,
} from "lucide-react";
import { universities } from "../data/universities";
import { useApp } from "../context/AppContext";

const Profile = ({ onClose }) => {
  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    createProfile,
    deleteProfile,
    deleteSemester,
    calculateCGPA,
    calculateSemesterGPA,
  } = useApp();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: "", university: "" });

  const handleCreateProfile = () => {
    if (newProfile.name && newProfile.university) {
      createProfile(newProfile.name, newProfile.university);
      setNewProfile({ name: "", university: "" });
      setShowCreateForm(false);
    }
  };

  const cgpa = calculateCGPA();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="profile-panel"
    >
      <div className="profile-header">
        <h2>
          <User size={20} /> Profile
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="close-btn"
          onClick={onClose}
        >
          <X size={20} />
        </motion.button>
      </div>

      <div className="profile-content">
        {profiles.length > 0 && (
          <div className="profile-selector">
            <label>Active Profile</label>
            <div className="select-wrapper">
              <select
                value={activeProfileId || ""}
                onChange={(e) => setActiveProfileId(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="select-icon" />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeProfile ? (
            <motion.div
              key={activeProfile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="profile-details"
            >
              <div className="profile-info-card">
                <div className="info-row">
                  <GraduationCap size={18} />
                  <span>{universities[activeProfile.university]?.shortName || activeProfile.university}</span>
                </div>
                <div className="info-row">
                  <Calendar size={18} />
                  <span>{activeProfile.semesters.length} Semesters</span>
                </div>
              </div>

              {activeProfile.semesters.length > 0 && (
                <div className="cgpa-display">
                  <div className="cgpa-label">Cumulative GPA</div>
                  <div className="cgpa-value">{cgpa}</div>
                  <div className="cgpa-scale">
                    out of {universities[activeProfile.university]?.scale || 4.0}
                  </div>
                </div>
              )}

              <div className="semesters-section">
                <h3>
                  <BookOpen size={18} /> Semesters
                </h3>
                {activeProfile.semesters.length === 0 ? (
                  <p className="empty-text">No semesters saved yet. Calculate and save your GPA!</p>
                ) : (
                  <div className="semesters-list">
                    {activeProfile.semesters.map((semester, index) => (
                      <motion.div
                        key={semester.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="semester-item"
                      >
                        <div className="semester-info">
                          <span className="semester-name">{semester.name}</span>
                          <span className="semester-meta">
                            {semester.courses.length} courses • GPA:{" "}
                            {calculateSemesterGPA(semester.courses, activeProfile.university)}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="delete-btn"
                          onClick={() => deleteSemester(semester.id)}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger"
                onClick={() => deleteProfile(activeProfile.id)}
              >
                <Trash2 size={18} />
                Delete Profile
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-profile"
            >
              <Award size={48} />
              <p>Create a profile to save your academic records</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="create-form"
            >
              <h3>Create New Profile</h3>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={newProfile.name}
                  onChange={(e) =>
                    setNewProfile({ ...newProfile, name: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>University</label>
                <div className="select-wrapper">
                  <select
                    value={newProfile.university}
                    onChange={(e) =>
                      setNewProfile({ ...newProfile, university: e.target.value })
                    }
                  >
                    <option value="">Select University</option>
                    {Object.entries(universities).map(([key, uni]) => (
                      <option key={key} value={key}>
                        {uni.shortName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon" />
                </div>
              </div>
              <div className="form-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                  onClick={handleCreateProfile}
                  disabled={!newProfile.name || !newProfile.university}
                >
                  Create Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary create-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              Create New Profile
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Profile;
