import { motion } from "framer-motion";
import { Sun, Moon, GraduationCap, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Header = ({ onProfileClick, showProfile }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="header"
    >
      <div className="header-content">
        <div className="logo">
          <GraduationCap size={28} />
          <span>BD CGPA Calculator</span>
        </div>
        <div className="header-actions">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onProfileClick}
            className={`icon-btn ${showProfile ? "active" : ""}`}
            title="Profile"
          >
            <User size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="icon-btn"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
