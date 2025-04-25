import { GoogleGenerativeAI } from "@google/generative-ai";
import { Response, Request } from "express";

export const chatSSE = async (req: Request, res: Response) => { 
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); 

  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const geminiMdeol = gemini.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "", 
  });   
  const stream = await geminiMdeol.generateContentStream("What is the capital of France?",);

  for await (const chunk of stream.stream) {
    if (chunk.text) {
      res.write(`data: ${chunk.text}\n\n`);
    }
  }

  res.end(); 
  res.on("close", () => {
    console.log("Connection closed by client");
    res.end();
  }); 

};
