import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set up PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * TranscriptParser - A dedicated utility to analyze university transcripts
 * and determine grading systems automatically
 */

// Known university patterns for direct matching
const UNIVERSITY_PATTERNS = {
  buet: {
    keywords: ["buet", "bangladesh university of engineering and technology"],
    patterns: [/buet/i, /engineering\s*and\s*technology/i],
  },
  du: {
    keywords: ["university of dhaka", "dhaka university"],
    patterns: [/university\s*of\s*dhaka/i, /dhaka\s*university/i],
  },
  nsu: {
    keywords: ["north south university", "nsu"],
    patterns: [/north\s*south\s*university/i],
  },
  bracu: {
    keywords: ["brac university", "bracu"],
    patterns: [/brac\s*university/i],
  },
  iub: {
    keywords: ["independent university", "iub"],
    patterns: [/independent\s*university/i],
  },
  aiub: {
    keywords: ["american international university-bangladesh", "aiub"],
    patterns: [/american\s*international\s*university/i, /aiub/i],
  },
  cuet: {
    keywords: ["chittagong university of engineering", "cuet"],
    patterns: [/chittagong\s*university\s*of\s*engineering/i, /cuet/i],
  },
  ruet: {
    keywords: ["rajshahi university of engineering", "ruet"],
    patterns: [/rajshahi\s*university\s*of\s*engineering/i, /ruet/i],
  },
  kuet: {
    keywords: ["khulna university of engineering", "kuet"],
    patterns: [/khulna\s*university\s*of\s*engineering/i, /kuet/i],
  },
  diu: {
    keywords: ["daffodil international university", "diu"],
    patterns: [/daffodil\s*international/i, /diu/i],
  },
};

// Known grading scales with their unique grade point values
const GRADING_SCALES = {
  // Scale A: Uses .75, .25 increments (BUET, AIUB, DU style)
  scaleA: {
    universities: ["buet", "aiub", "cuet", "ruet", "kuet", "du", "diu"],
    uniquePoints: [3.75, 3.25, 2.75, 2.25, 1.75],
    grades: [
      { letter: "A+", point: 4.0, minMarks: 80 },
      { letter: "A", point: 3.75, minMarks: 75 },
      { letter: "A-", point: 3.5, minMarks: 70 },
      { letter: "B+", point: 3.25, minMarks: 65 },
      { letter: "B", point: 3.0, minMarks: 60 },
      { letter: "B-", point: 2.75, minMarks: 55 },
      { letter: "C+", point: 2.5, minMarks: 50 },
      { letter: "C", point: 2.25, minMarks: 45 },
      { letter: "D", point: 2.0, minMarks: 40 },
      { letter: "F", point: 0.0, minMarks: 0 },
    ],
  },
  // Scale B: Uses .7, .3 increments (NSU, BRACU style)
  scaleB: {
    universities: ["nsu", "bracu"],
    uniquePoints: [3.7, 3.3, 2.7, 2.3, 1.7, 1.3],
    grades: [
      { letter: "A", point: 4.0, minMarks: 90 },
      { letter: "A-", point: 3.7, minMarks: 85 },
      { letter: "B+", point: 3.3, minMarks: 80 },
      { letter: "B", point: 3.0, minMarks: 75 },
      { letter: "B-", point: 2.7, minMarks: 70 },
      { letter: "C+", point: 2.3, minMarks: 65 },
      { letter: "C", point: 2.0, minMarks: 60 },
      { letter: "C-", point: 1.7, minMarks: 55 },
      { letter: "D+", point: 1.3, minMarks: 50 },
      { letter: "D", point: 1.0, minMarks: 45 },
      { letter: "F", point: 0.0, minMarks: 0 },
    ],
  },
  // Scale C: Uses .67, .33 increments (IUB style)
  scaleC: {
    universities: ["iub"],
    uniquePoints: [3.67, 3.33, 2.67, 2.33, 1.67, 1.33],
    grades: [
      { letter: "A", point: 4.0, minMarks: 90 },
      { letter: "A-", point: 3.67, minMarks: 85 },
      { letter: "B+", point: 3.33, minMarks: 80 },
      { letter: "B", point: 3.0, minMarks: 75 },
      { letter: "B-", point: 2.67, minMarks: 70 },
      { letter: "C+", point: 2.33, minMarks: 65 },
      { letter: "C", point: 2.0, minMarks: 60 },
      { letter: "C-", point: 1.67, minMarks: 55 },
      { letter: "D+", point: 1.33, minMarks: 50 },
      { letter: "D", point: 1.0, minMarks: 45 },
      { letter: "F", point: 0.0, minMarks: 0 },
    ],
  },
};

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from a text file
 */
export async function extractTextFromTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read text file"));
    reader.readAsText(file);
  });
}

/**
 * Detect university from text content
 */
export function detectUniversity(text) {
  const lowerText = text.toLowerCase();
  
  for (const [key, config] of Object.entries(UNIVERSITY_PATTERNS)) {
    // Check keywords
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        return { university: key, confidence: "high", method: "keyword" };
      }
    }
    
    // Check patterns
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        return { university: key, confidence: "high", method: "pattern" };
      }
    }
  }
  
  return null;
}

/**
 * Extract grade points from text
 */
export function extractGradePoints(text) {
  const gradePoints = [];
  
  // Pattern to match grade points (e.g., 3.75, 4.0, 2.67)
  const gradePointPattern = /\b([0-4])\.(0{1,2}|[0-9]{1,2})\b/g;
  let match;
  
  while ((match = gradePointPattern.exec(text)) !== null) {
    const point = parseFloat(match[0]);
    if (point >= 0 && point <= 4) {
      gradePoints.push(point);
    }
  }
  
  return [...new Set(gradePoints)].sort((a, b) => b - a);
}

/**
 * Extract letter grades from text
 */
export function extractLetterGrades(text) {
  const grades = [];
  
  // Pattern to match letter grades
  const gradePattern = /\b([A-F][+-]?)\b/g;
  let match;
  
  while ((match = gradePattern.exec(text)) !== null) {
    const grade = match[1].toUpperCase();
    if (/^[A-F][+-]?$/.test(grade)) {
      grades.push(grade);
    }
  }
  
  return [...new Set(grades)];
}

/**
 * Extract courses with grades and credits from text
 */
export function extractCourses(text) {
  const courses = [];
  const lines = text.split(/\n|\r/);
  
  // Pattern to match course lines (flexible)
  // Looks for: course code/name, possibly credits, grade/points
  const coursePatterns = [
    // Pattern: CODE NAME CREDIT GRADE POINT
    /([A-Z]{2,4}\s*\d{3,4}[A-Z]?)\s+(.+?)\s+(\d+\.?\d*)\s+([A-F][+-]?)\s+(\d+\.?\d*)/gi,
    // Pattern: NAME CREDIT GRADE
    /(.+?)\s+(\d+\.?\d*)\s+([A-F][+-]?)\s*$/gim,
    // Pattern: CODE GRADE CREDIT
    /([A-Z]{2,4}\s*\d{3,4})\s+([A-F][+-]?)\s+(\d+\.?\d*)/gi,
  ];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 5) continue;
    
    for (const pattern of coursePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(trimmedLine);
      if (match) {
        courses.push({
          raw: trimmedLine,
          code: match[1]?.trim(),
          name: match[2]?.trim(),
          credit: parseFloat(match[3]) || parseFloat(match[2]) || 3,
          grade: match[4] || match[3],
        });
        break;
      }
    }
  }
  
  return courses;
}

/**
 * Determine grading scale from extracted grade points
 */
export function determineGradingScale(gradePoints) {
  if (gradePoints.length === 0) {
    return null;
  }
  
  // Check for Scale C (.67, .33) - IUB style
  const hasScaleC = gradePoints.some(
    (p) => Math.abs(p - 3.67) < 0.01 || 
           Math.abs(p - 3.33) < 0.01 || 
           Math.abs(p - 2.67) < 0.01 ||
           Math.abs(p - 1.67) < 0.01 ||
           Math.abs(p - 1.33) < 0.01
  );
  if (hasScaleC) {
    return { scale: "scaleC", confidence: "high", likely: "iub" };
  }
  
  // Check for Scale B (.7, .3) - NSU/BRACU style
  const hasScaleB = gradePoints.some(
    (p) => Math.abs(p - 3.7) < 0.01 || 
           Math.abs(p - 3.3) < 0.01 || 
           Math.abs(p - 2.7) < 0.01 ||
           Math.abs(p - 2.3) < 0.01 ||
           Math.abs(p - 1.7) < 0.01 ||
           Math.abs(p - 1.3) < 0.01
  );
  if (hasScaleB) {
    return { scale: "scaleB", confidence: "high", likely: "nsu" };
  }
  
  // Check for Scale A (.75, .25) - BUET/AIUB style
  const hasScaleA = gradePoints.some(
    (p) => Math.abs(p - 3.75) < 0.01 || 
           Math.abs(p - 3.25) < 0.01 || 
           Math.abs(p - 2.75) < 0.01 ||
           Math.abs(p - 2.25) < 0.01 ||
           Math.abs(p - 1.75) < 0.01
  );
  if (hasScaleA) {
    return { scale: "scaleA", confidence: "high", likely: "buet" };
  }
  
  // If only standard points (4.0, 3.5, 3.0, 2.5, 2.0), could be any scale
  return { scale: "scaleA", confidence: "low", likely: "unknown" };
}

/**
 * Build a custom grading scale from extracted data
 */
export function buildCustomGradingScale(gradePoints, letterGrades) {
  const grades = [];
  
  // Sort grade points descending
  const sortedPoints = [...gradePoints].sort((a, b) => b - a);
  
  // Common letter grades in order
  const commonGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];
  
  // Try to match points with grades
  for (let i = 0; i < sortedPoints.length && i < commonGrades.length; i++) {
    grades.push({
      letter: commonGrades[i],
      point: sortedPoints[i],
    });
  }
  
  // Ensure F grade exists
  if (!grades.find((g) => g.letter === "F")) {
    grades.push({ letter: "F", point: 0.0 });
  }
  
  return {
    name: "Custom (Detected)",
    shortName: "Custom",
    scale: 4.0,
    grades,
  };
}

/**
 * Main function to parse and analyze a transcript
 */
export async function parseTranscript(file) {
  const result = {
    success: false,
    university: null,
    gradingScale: null,
    detectedGradePoints: [],
    detectedGrades: [],
    courses: [],
    rawText: "",
    confidence: "low",
    customScale: null,
    error: null,
  };
  
  try {
    // Step 1: Extract text based on file type
    let text = "";
    const fileName = file.name.toLowerCase();
    
    if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
      text = await extractTextFromPDF(file);
    } else if (
      file.type.startsWith("text/") || 
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv")
    ) {
      text = await extractTextFromTextFile(file);
    } else {
      // For images or unsupported types, use filename only
      text = file.name;
    }
    
    // Add filename to search text
    text += " " + file.name;
    result.rawText = text;
    
    // Step 2: Try to detect university directly
    const universityResult = detectUniversity(text);
    if (universityResult) {
      result.university = universityResult.university;
      result.confidence = universityResult.confidence;
    }
    
    // Step 3: Extract grade points and letter grades
    result.detectedGradePoints = extractGradePoints(text);
    result.detectedGrades = extractLetterGrades(text);
    
    // Step 4: Determine grading scale from grade points
    if (result.detectedGradePoints.length > 0) {
      const scaleResult = determineGradingScale(result.detectedGradePoints);
      
      if (scaleResult) {
        result.gradingScale = scaleResult.scale;
        
        // If university wasn't detected, use the likely one from scale
        if (!result.university && scaleResult.likely !== "unknown") {
          result.university = scaleResult.likely;
          result.confidence = "medium";
        }
        
        // Update confidence if scale detection was strong
        if (scaleResult.confidence === "high" && result.confidence !== "high") {
          result.confidence = "medium";
        }
      }
    }
    
    // Step 5: Extract courses
    result.courses = extractCourses(text);
    
    // Step 6: Build custom grading scale if needed
    if (result.detectedGradePoints.length >= 3) {
      result.customScale = buildCustomGradingScale(
        result.detectedGradePoints,
        result.detectedGrades
      );
    }
    
    result.success = !!(result.university || result.gradingScale || result.customScale);
    
  } catch (error) {
    result.error = error.message;
    console.error("Transcript parsing error:", error);
  }
  
  return result;
}

/**
 * Get the appropriate university key based on parsing results
 */
export function getUniversityFromResult(result) {
  if (result.university) {
    return result.university;
  }
  
  if (result.gradingScale) {
    const scale = GRADING_SCALES[result.gradingScale];
    if (scale && scale.universities.length > 0) {
      return scale.universities[0];
    }
  }
  
  return null;
}

export { GRADING_SCALES, UNIVERSITY_PATTERNS };
