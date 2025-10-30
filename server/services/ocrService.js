import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const extractTextFromImage = async (fileBuffer, mimeType) => {
  try {
    console.log("Using Tesseract OCR (as per SRS)...");
    const tesseractResult = await extractWithTesseract(fileBuffer);
    const tesseractText = tesseractResult.text;
    const confidence = tesseractResult.confidence;

    console.log(
      `Tesseract extracted: ${tesseractText.length} characters (confidence: ${confidence.toFixed(2)}%)`
    );

    if (confidence < 70 && process.env.GEMINI_API_KEY) {
      console.log("Low confidence detected, enhancing with Gemini...");
      try {
        const geminiText = await extractWithGemini(fileBuffer, mimeType);
        console.log(`Gemini extracted: ${geminiText.length} characters`);

        if (geminiText.length > tesseractText.length * 1.2) {
          console.log("Using Gemini result (better extraction)");
          return geminiText;
        }
      } catch (geminiError) {
        console.warn("Gemini enhancement failed:", geminiError.message);
      }
    }

    console.log("Using Tesseract result");
    return tesseractText;
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from image");
  }
};

const extractWithTesseract = async (fileBuffer) => {
  const result = await Tesseract.recognize(fileBuffer, "eng");

  console.log(`Tesseract confidence: ${result.data.confidence.toFixed(2)}%`);

  return {
    text: result.data.text.trim(),
    confidence: result.data.confidence,
  };
};

const extractWithGemini = async (fileBuffer, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const imageParts = [
    {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimeType || "image/jpeg",
      },
    },
  ];

  const prompt =
    "Extract all text from this image (handwritten or printed). Return only the exact text you see, preserving line breaks and formatting. Do not add any commentary or explanations.";

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  return response.text().trim();
};

export const extractTextFromPDF = async (fileBuffer) => {
  try {
    console.log("Using PDF.js for PDF text extraction...");
    const uint8Array = new Uint8Array(fileBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
      verbosity: 0
    });
    const pdf = await loadingTask.promise;
    console.log(`PDF has ${pdf.numPages} page(s)`);

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
      console.log(`Extracted page ${pageNum}/${pdf.numPages}`);
    }

    const extractedText = fullText.trim();
    console.log(`PDF.js extraction completed: ${extractedText.length} characters`);

    if (extractedText.length < 50 && process.env.GEMINI_API_KEY) {
      console.log("PDF appears to be scanned (image-based), enhancing with Gemini...");
      try {
        const geminiText = await extractWithGemini(fileBuffer, "application/pdf");
        if (geminiText.length > extractedText.length) {
          console.log(`Using Gemini result: ${geminiText.length} characters`);
          return geminiText;
        }
      } catch (error) {
        console.warn("Gemini PDF extraction failed:", error.message);
      }
    }

    console.log("Using PDF.js result");
    return extractedText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
