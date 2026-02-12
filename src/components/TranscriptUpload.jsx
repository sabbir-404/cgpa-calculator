import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { universities } from "../data/universities";

const TranscriptUpload = ({ onUniversityDetected, detectedUniversity }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Keywords to detect universities from transcript
  const universityKeywords = {
    buet: ["buet", "bangladesh university of engineering", "engineering and technology"],
    du: ["university of dhaka", "dhaka university", "du result"],
    nsu: ["north south university", "nsu", "north south"],
    bracu: ["brac university", "bracu", "brac uni"],
    iub: ["independent university", "iub", "independent university bangladesh"],
    aiub: ["american international university", "aiub", "aiub-bangladesh"],
    cuet: ["cuet", "chittagong university of engineering"],
    ruet: ["ruet", "rajshahi university of engineering"],
    kuet: ["kuet", "khulna university of engineering"],
    diu: ["daffodil international", "diu", "daffodil university"],
  };

  // Grade patterns to help identify grading system
  const gradePatterns = {
    nsu: /\b(A|A-|B\+|B|B-|C\+|C|C-|D\+|D|F)\s*[:\-]?\s*(4\.0|3\.7|3\.3|3\.0|2\.7|2\.3|2\.0|1\.7|1\.3|1\.0|0\.0)/gi,
    buet: /\b(A\+|A|A-|B\+|B|B-|C\+|C|C-|D|F)\s*[:\-]?\s*(4\.0|3\.75|3\.5|3\.25|3\.0|2\.75|2\.5|2\.25|2\.0|1\.75|0\.0)/gi,
  };

  const detectUniversity = (text) => {
    const lowerText = text.toLowerCase();
    
    // First try to match university name
    for (const [key, keywords] of Object.entries(universityKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return key;
        }
      }
    }

    // Try to detect by grade point patterns
    // NSU uses 3.7, 3.3, 2.7, 2.3, 1.7, 1.3
    if (/3\.7|3\.3|2\.7|2\.3|1\.7|1\.3/g.test(text)) {
      // Could be NSU, BRACU, or IUB
      if (/3\.67|2\.67|1\.67/g.test(text)) {
        return "iub";
      }
      return "nsu";
    }

    // BUET/DU pattern uses 3.75, 3.25, 2.75, 2.25, 1.75
    if (/3\.75|3\.25|2\.75|2\.25|1\.75/g.test(text)) {
      return "buet";
    }

    return null;
  };

  const handleFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);

    try {
      let text = "";

      if (file.type === "application/pdf") {
        // For PDF, we'll read as text (basic extraction)
        // In production, you'd use a PDF parsing library
        const reader = new FileReader();
        text = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });
      } else if (file.type.includes("image")) {
        // For images, we can't extract text without OCR
        // Just use filename for now
        text = file.name;
      } else {
        // For text files
        const reader = new FileReader();
        text = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });
      }

      // Also check filename
      text += " " + file.name;

      const detected = detectUniversity(text);
      
      if (detected) {
        onUniversityDetected(detected);
      } else {
        // If not detected, show alert and let user select manually
        alert("Could not automatically detect university. Please select manually.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please select university manually.");
    }

    setIsProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const clearDetection = () => {
    onUniversityDetected("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-section">
      <motion.div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="upload-input"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileInput}
        />
        <div className="upload-icon">
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FileText size={32} />
            </motion.div>
          ) : (
            <Upload size={32} />
          )}
        </div>
        <p className="upload-text">
          {isProcessing ? "Processing..." : "Upload your transcript"}
        </p>
        <p className="upload-hint">
          Drop a file or click to browse (PDF, Image, or Text)
        </p>
      </motion.div>

      <AnimatePresence>
        {detectedUniversity && universities[detectedUniversity] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="detected-info"
          >
            <CheckCircle size={20} />
            <div className="detected-text">
              <strong>University Detected</strong>
              <span>{universities[detectedUniversity].name}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                clearDetection();
              }}
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TranscriptUpload;
