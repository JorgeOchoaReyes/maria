import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";
import dotenv from "dotenv";
dotenv.config();

export const chatSSE = async (req: Request, res: Response) => { 
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); 
 
  const prompt = req.query.prompt as string || "What is the capital of France?";
 
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const geminiMdeol = gemini.getGenerativeModel({
    model: "gemini-1.5-flash", 
  });   
  const stream = await geminiMdeol.generateContentStream(prompt); 

  for await (const chunk of stream.stream) {
    if (chunk.text) {   
      res.write("data: " + chunk.text() + "\n");
    } 
  }
  res.write("data: [DONE]\n\n");
  res.end();
 
  res.on("close", () => {
    console.log("Connection closed by client");
    res.end(); 
  });   

};
