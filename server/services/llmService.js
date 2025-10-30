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
                maxOutputTokens: 1000,
            }
        });

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
