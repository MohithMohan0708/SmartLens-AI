import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeText = async (extractedText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        console.log("Starting LLM analysis...");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Analyze the following text and provide:
1. A concise summary (2-3 sentences)
2. Key points or main ideas (3-5 bullet points)
3. Important keywords or topics (5-10 words)
4. Sentiment/tone (positive, negative, neutral, or mixed)

Text to analyze:
"""
${extractedText}
"""

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "...", "..."],
  "keywords": ["...", "...", "..."],
  "sentiment": "..."
}`;

        const result = await model.generateContent(prompt);
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
        throw new Error("Failed to analyze text with LLM");
    }
};
