import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Fetching available models...\n");
    
    const models = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro-vision"
    ];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✓ ${modelName} - WORKS`);
      } catch (error) {
        console.log(`✗ ${modelName} - ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
