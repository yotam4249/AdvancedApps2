
import { Request, Response } from "express";
import OpenAI from "openai";

const configuration = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

export const generateResponse = async(req:Request,res:Response):Promise<void> =>{
    const {prompt} = req.body
    if (!prompt) {
        res.status(400).json({ error: "Prompt is required." });
    }
    try{
        const response = await configuration.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        res.json({ response: response.choices[0].message.content });
    }catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Failed to get OpenAI response" });
    }
}