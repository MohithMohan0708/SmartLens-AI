import { uploadToSupabase } from "../services/storageService.js";
import { supabase } from "../services/supabaseClient.js";
import { queries } from "../db/queries.js";
import { extractTextFromImage, extractTextFromPDF } from "../services/ocrService.js";

export const uploadNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images (JPG/JPEG, PNG) and PDF are allowed."
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB."
      });
    }

    const userExists = await queries.getUserById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again."
      });
    }

    console.log(`\n=== Starting text extraction for ${file.mimetype} ===`);
    let extractedText;
    let extractionMethod = "";

    if (file.mimetype === "application/pdf") {
      extractionMethod = "PDF.js";
      extractedText = await extractTextFromPDF(file.buffer);
    } else {
      extractionMethod = "Tesseract/Gemini";
      extractedText = await extractTextFromImage(file.buffer, file.mimetype);
    }

    if (!extractedText || extractedText.length < 200) {
      return res.status(400).json({
        success: false,
        message: `Extracted text is too short. Minimum 200 characters required. Found: ${extractedText.length} characters.`,
        extractedText: extractedText,
      });
    }

    console.log(`✓ Text extraction completed using ${extractionMethod}: ${extractedText.length} characters\n`);

    const { data: existingNotes, error: checkError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("extracted_text", extractedText);

    if (checkError) {
      console.warn("Duplicate check failed:", checkError.message);
    }

    if (existingNotes && existingNotes.length > 0) {
      console.log("Duplicate content detected, returning existing note");
      return res.status(200).json({
        success: true,
        message: "Duplicate content detected. Returning existing note with analysis.",
        note: existingNotes[0],
        extractedTextLength: extractedText.length,
        analysisCompleted: existingNotes[0].analysis_result !== null,
        isDuplicate: true,
      });
    }

    const imageUrl = await uploadToSupabase(file, userId);

    let analysisResult = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const { analyzeText } = await import("../services/llmService.js");
        analysisResult = await analyzeText(extractedText);
        console.log("✓ LLM analysis completed\n");
      } catch (analysisError) {
        console.warn("LLM analysis failed:", analysisError.message);
      }
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          original_image_url: imageUrl,
          extracted_text: extractedText,
          analysis_result: analysisResult,
        },
      ])
      .select();

    if (error) {
      console.error("Database insert error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save note to database.",
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded, text extracted, and analyzed successfully!",
      note: data[0],
      extractedTextLength: extractedText.length,
      analysisCompleted: analysisResult !== null,
      isDuplicate: false,
    });
  } catch (err) {
    console.error("Upload error:", err.message);

    if (err.message.includes("Failed to extract text")) {
      return res.status(500).json({
        success: false,
        message: "Text extraction failed. Please try with a clearer file.",
      });
    }

    if (err.message.includes("Bucket not found")) {
      return res.status(500).json({
        success: false,
        message: "Storage bucket not configured properly.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Upload failed!",
      error: err.message,
    });
  }
};
