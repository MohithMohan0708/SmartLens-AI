import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeText = async (extractedText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        console.log("Starting LLM analysis...");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048, // Increased to allow longer responses for large documents
            }
        });

        const prompt = `You are analyzing a document. Automatically adjust the depth and detail of your analysis based on the content's length and complexity.

ADAPTIVE ANALYSIS RULES:
- For short documents (< 500 words): Provide concise summaries and essential points
- For medium documents (500-2000 words): Provide comprehensive summaries and detailed points
- For long documents (2000-5000 words): Provide extensive summaries and thorough analysis
- For very long documents (5000+ words): Provide in-depth summaries and exhaustive point extraction

IMPORTANT: Do NOT artificially limit yourself. Extract ALL significant information proportional to the document's scope.
- Summary: Scale naturally with content (short docs = 3-5 sentences, long docs = 15-20+ sentences)
- Key Points: Extract ALL major themes and ideas (aim for 1 key point per 200-300 words of content)
- Keywords: Identify all relevant terms (scale from 5-8 for short docs to 15-20+ for long docs)
- Be thorough and comprehensive - longer documents deserve more detailed analysis

Text to analyze:
"""
${extractedText}
"""

Respond in JSON format:
{
  "summary": "Comprehensive summary proportional to document length...",
  "keyPoints": ["point1", "point2", "point3", ...],
  "keywords": ["keyword1", "keyword2", "keyword3", ...],
  "sentiment": "positive/negative/neutral/mixed",
  "category": "work/personal/study/meeting/todo/notes/other",
  "actionItems": ["action1", "action2", ...],
  "entities": {
    "people": ["person1", "person2", ...],
    "dates": ["date1", "date2", ...],
    "places": ["place1", "place2", ...]
  }
}

Extract all meaningful information without artificial constraints.`;

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Analysis timeout - request took too long')), 30000)
        );

        const analysisPromise = model.generateContent(prompt);
        const result = await Promise.race([analysisPromise, timeoutPromise]);

        const response = result.response;
        const analysisText = response.text().trim();

        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse LLM response");
        }

        const analysis = JSON.parse(jsonMatch[0]);

        console.log("LLM analysis completed successfully");
        return analysis;
    } catch (error) {
        console.error("LLM analysis error:", error);

        // Provide more specific error messages
        if (error.message?.includes('quota')) {
            throw new Error("API quota exceeded - too many requests");
        } else if (error.message?.includes('rate limit')) {
            throw new Error("Rate limit exceeded - please wait a moment");
        } else if (error.message?.includes('timeout')) {
            throw new Error("Analysis timeout - request took too long");
        } else if (error.message?.includes('API key')) {
            throw new Error("API key issue - please check configuration");
        } else {
            throw new Error("Failed to analyze text with AI");
        }
    }
};
