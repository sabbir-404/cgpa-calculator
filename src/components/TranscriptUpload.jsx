import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { universities } from "../data/universities";
import { parseTranscript, getUniversityFromResult } from "../utils/transcriptParser";

const TranscriptUpload = ({ onUniversityDetected, onParseResult, detectedUniversity }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setParseResult(null);

    try {
      // Use the dedicated transcript parser
      const result = await parseTranscript(file);
      setParseResult(result);

      if (result.success) {
        const universityKey = getUniversityFromResult(result);
        
        if (universityKey) {
          onUniversityDetected(universityKey);
        }
        
        // Pass full parse result to parent if callback provided
        if (onParseResult) {
          onParseResult(result);
        }
      } else if (result.error) {
        setError(result.error);
      } else {
        setError("Could not detect grading system. Please select your university manually.");
      }
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file. Please try again or select manually.");
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
    setParseResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getConfidenceLabel = (confidence) => {
    switch (confidence) {
      case "high":
        return "High confidence";
      case "medium":
        return "Medium confidence";
      default:
        return "Low confidence";
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
          accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
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
          {isProcessing ? "Analyzing transcript..." : "Upload your transcript"}
        </p>
        <p className="upload-hint">
          {isProcessing 
            ? "Detecting university and grading system"
            : "Drop a PDF or text file to auto-detect grading system"
          }
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && !detectedUniversity && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="detected-info error"
          >
            <AlertCircle size={20} />
            <div className="detected-text">
              <strong>Detection Failed</strong>
              <span>{error}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}

        {detectedUniversity && universities[detectedUniversity] && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="detected-info success"
          >
            <CheckCircle size={20} />
            <div className="detected-text">
              <strong>University Detected</strong>
              <span>
                {universities[detectedUniversity].name}
                {parseResult?.confidence && (
                  <span className="confidence-badge">
                    {getConfidenceLabel(parseResult.confidence)}
                  </span>
                )}
              </span>
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

        {parseResult && parseResult.detectedGradePoints.length > 0 && !detectedUniversity && (
          <motion.div
            key="partial"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="detected-info partial"
          >
            <Info size={20} />
            <div className="detected-text">
              <strong>Grading System Detected</strong>
              <span>
                Found grade points: {parseResult.detectedGradePoints.slice(0, 5).join(", ")}
                {parseResult.detectedGradePoints.length > 5 && "..."}
              </span>
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
