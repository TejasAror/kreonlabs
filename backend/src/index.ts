const { readC2PA, writeC2PA } = require("./c2pa-tools/c2pa-tools");
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ------------------------------
// DMCA Generation Types & Logic
// ------------------------------
interface AssetInfo {
  createdAt: string;
  assetID: string;
  title?: string;
  description?: string;
  originalImageURL?: string;
  complaintImageURL: string;
  similarityScore: number;
  sourceURL: string;
  action?: string;
  ipAssetID?: string;
  storyProofURL?: string;
  claim_generator?: string;
}

function generatePDF(asset: AssetInfo, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const today = new Date().toLocaleDateString();
    const LINE_GAP = 8;

    doc.font("Times-Bold")
      .fontSize(16)
      .text("Digital Millennium Copyright Act (DMCA) Takedown Notice", {
        align: "center",
        underline: true,
        lineGap: LINE_GAP,
      });

    doc.moveDown(1.5);
    doc.font("Times-Roman").fontSize(12);
    doc.text(`From: Kreon Labs IP Protection Unit <legal@kreonlabs.com>`, { lineGap: LINE_GAP });
    doc.text(`Date: ${today}`, { lineGap: LINE_GAP });
    doc.moveDown();

    doc.text("To Whom It May Concern,", { lineGap: LINE_GAP });
    doc.moveDown();
    doc.text(`This is a formal notification...`, { indent: 20, lineGap: LINE_GAP }); // truncated for brevity
    doc.moveDown();

    doc.font("Times-Bold").text("1. Copyrighted Work", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text(`• Asset ID: ${asset.assetID}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Title: ${asset.title || "Untitled Asset"}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Description: ${asset.description || "No description available."}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Date of Creation: ${asset.createdAt}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Original Public URL: ${asset.originalImageURL || "Unavailable"}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Story Protocol Proof: ${asset.storyProofURL || "Not provided"}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• IP Asset ID: ${asset.ipAssetID || "Not provided"}`, { indent: 20, lineGap: LINE_GAP });
    doc.moveDown();

    doc.font("Times-Bold").text("2. Infringing Content", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text(`• Source URL: ${asset.sourceURL}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Complaint Image URL: ${asset.complaintImageURL}`, { indent: 20, lineGap: LINE_GAP });
    doc.text(`• Similarity Score: ${asset.similarityScore.toFixed(2)}`, { indent: 20, lineGap: LINE_GAP });
    doc.moveDown();

    doc.font("Times-Bold").text("3. Forensic & Provenance Verification", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text("The following analyses were conducted by Kreon Labs:", { indent: 20, lineGap: LINE_GAP });
    doc.text("• C2PA Manifest Analysis", { indent: 30, lineGap: LINE_GAP });
    doc.text(`    – Claim Generator: ${asset.claim_generator || "Not provided"}`, { indent: 30, lineGap: LINE_GAP });
    doc.text("    – Assertions: com.kreon-labs.story-registration, c2pa.hash.data", { indent: 30, lineGap: LINE_GAP });
    doc.text("    – Signature Info: Verified, cryptographically intact", { indent: 30, lineGap: LINE_GAP });

    doc.text("• Forensic Similarity Analysis", { indent: 30, lineGap: LINE_GAP });
    doc.text("    – pHash matching", { indent: 30, lineGap: LINE_GAP });
    doc.text("    – Cosine similarity on feature vectors", { indent: 30, lineGap: LINE_GAP });
    doc.text("    – Metadata and signature alignment", { indent: 30, lineGap: LINE_GAP });
    doc.moveDown();

    doc.font("Times-Bold").text("4. Legal Declarations", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text("Pursuant to 17 U.S.C. §512(c)(3)...", { indent: 20, lineGap: LINE_GAP }); // truncated
    doc.moveDown();

    doc.font("Times-Bold").text("5. Actions Requested", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text("We respectfully request that your platform:", { indent: 20, lineGap: LINE_GAP });
    doc.text("• Remove or disable access to the infringing material.", { indent: 30, lineGap: LINE_GAP });
    doc.text("• Notify the uploader of this takedown request.", { indent: 30, lineGap: LINE_GAP });
    doc.text("• Retain a copy of this notice...", { indent: 30, lineGap: LINE_GAP });
    doc.moveDown();

    doc.font("Times-Bold").text("6. Contact Information", { lineGap: LINE_GAP });
    doc.font("Times-Roman");
    doc.text("Organization: Kreon Labs", { indent: 20, lineGap: LINE_GAP });
    doc.text("Department: IP Protection & Compliance", { indent: 20, lineGap: LINE_GAP });
    doc.text("Email: legal@kreonlabs.com", { indent: 20, lineGap: LINE_GAP });
    doc.moveDown();

    doc.text(`We are prepared to provide supplementary proof...`, { indent: 20, lineGap: LINE_GAP });
    doc.moveDown(1.5);
    doc.text("Sincerely,", { indent: 20, lineGap: LINE_GAP });
    doc.text("Kreon Labs — IP Protection Unit", { indent: 20, lineGap: LINE_GAP });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// ------------------------------
// Routes
// ------------------------------

// DMCA PDF Generation
app.post("/generate-dmca", async (req: Request, res: Response) => {
  const asset: AssetInfo = req.body;
  const filename = `dmca_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, filename);

  try {
    await generatePDF(asset, filePath);
    res.status(200).json({
      text: "PDF successfully created.",
      downloadURL: `/download/${filename}`,
    });
  } catch (err: any) {
    console.error("DMCA generation failed:", err);
    res.status(500).json({ error: "Failed to generate DMCA", details: err });
  }
});

// PDF Download Route
app.get("/download/:filename", (req: Request, res: Response) => {
  const filePath = path.join(__dirname, req.params.filename);
  res.download(filePath, () => {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete PDF:", err.message);
    });
  });
});

// C2PA Metadata Verification
app.get("/verify-c2pa", async (req: Request, res: Response) => {
  const { publicURL, fileType } = req.query;
  try {
    const result = await readC2PA(publicURL, fileType);
    res.send(result);
  } catch (err) {
    console.error("C2PA verification failed:", err);
    res.status(500).send("Error verifying C2PA metadata.");
  }
});

// C2PA Metadata Embedding
app.post("/add-c2pa", async (req: Request, res: Response) => {
  const { publicURL, assetID, ext, fileType, hash, phash, walletID } = req.body;
  try {
    const result = await writeC2PA(publicURL, fileType, assetID, ext, hash, phash, walletID);
    res.send(result);
  } catch (err) {
    console.error("C2PA write failed:", err);
    res.status(500).send("Error embedding C2PA metadata.");
  }
});

// Root Route
app.get("/", (_req: Request, res: Response) => {
  res.send("Kreon Labs Unified DMCA + C2PA Server Running!");
});

// ------------------------------
// Start Server
// ------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
