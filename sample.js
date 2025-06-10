import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // <-- Add this line
const IMAGE_PATH = "contoso_layout_sketch.jpg"; // Ensure this file exists
const RESIZED_IMAGE_PATH = "contoso_layout_sketch_small.jpg";

// Resize the image before sending it for captioning
async function resizeImage() {
  await sharp(IMAGE_PATH)
    .resize({ width: 1024 }) // or lower if needed
    .toFile(RESIZED_IMAGE_PATH);
}

async function runImageCaptioning() {
  // Resize the image first
  await resizeImage();

  const imageBuffer = fs.readFileSync(RESIZED_IMAGE_PATH);

  const response = await fetch(
    "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
        // You can use GITHUB_TOKEN in API calls to GitHub if needed
      },
      body: imageBuffer,
    }
  );

  if (!response.ok) {
    console.error("Failed:", response.status, response.statusText);
    const errorText = await response.text();
    console.error(errorText);
    return;
  }

  const result = await response.json();
  console.log("🧠 Image Caption:", result[0]?.generated_text || "No caption found.");
}

runImageCaptioning();
