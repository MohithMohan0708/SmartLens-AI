import { uploadToSupabase } from "../services/storageService.js";
import { supabase } from "../services/supabaseClient.js";
import { queries } from "../db/queries.js";
import { extractTextFromImage, extractTextFromPDF } from "../services/ocrService.js";

export const getUserNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch notes error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notes.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      notes: data,
    });
  } catch (err) {
    console.error("Get user notes error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notes.",
      error: err.message,
    });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const authenticatedUserId = parseInt(req.user.id);

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Note not found.",
        });
      }
      console.error("Fetch note error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch note.",
        error: error.message,
      });
    }

    if (data.user_id !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This note belongs to another user.",
      });
    }

    return res.status(200).json({
      success: true,
      note: data,
    });
  } catch (err) {
    console.error("Get note by ID error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve note.",
      error: err.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    const authenticatedUserId = parseInt(req.user.id);

    // First, check if the note exists and belongs to the user
    const { data: note, error: fetchError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Note not found.",
        });
      }
      console.error("Fetch note error:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch note.",
        error: fetchError.message,
      });
    }

    // Check if the note belongs to the authenticated user
    if (note.user_id !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own notes.",
      });
    }

    // Delete the note
    const { error: deleteError } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (deleteError) {
      console.error("Delete note error:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete note.",
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (err) {
    console.error("Delete note error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete note.",
      error: err.message,
    });
  }
};

export const uploadNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    const { title } = req.body || {};

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
    let analysisError = null;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const { analyzeText } = await import("../services/llmService.js");
        analysisResult = await analyzeText(extractedText);
        console.log("✓ LLM analysis completed\n");
      } catch (error) {
        console.warn("LLM analysis failed:", error.message);
        analysisError = error.message;
        
        // Check for specific error types
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          analysisError = "API quota exceeded. Please try again later.";
        } else if (error.message.includes('timeout')) {
          analysisError = "Analysis timed out. Please try again.";
        } else {
          analysisError = "AI analysis temporarily unavailable.";
        }
      }
    } else {
      analysisError = "AI analysis not configured.";
    }

    // Auto-generate title if not provided
    const noteTitle = title || extractedText.substring(0, 50).trim() + (extractedText.length > 50 ? '...' : '');

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title: noteTitle,
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
      message: analysisResult 
        ? "File uploaded, text extracted, and analyzed successfully!" 
        : `File uploaded and text extracted. ${analysisError}`,
      note: data[0],
      extractedTextLength: extractedText.length,
      analysisCompleted: analysisResult !== null,
      analysisError: analysisError,
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
