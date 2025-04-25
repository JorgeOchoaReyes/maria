import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { db } from "@repo/firebase-admin";
import { chatSSE } from "./routes/chat";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/chat", chatSSE)
    .get("/message/:name", (req, res) => {
      return res.json({ message: `hello ${req.params.name}` });
    })
    .get("/status", async (_, res) => {
      const testData = await db.collection("asdasd").doc("asdasd").get(); 
      console.log(testData.data()); 
      return res.json({ ok: true });
    });

  return app;
};
