import * as dotenv from 'dotenv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai'; 

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function buildDatabase() {
  try {
    const PDF_PATH = './MedData.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();
    console.log("✅ PDF Loaded");

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    console.log(`✅ Text Splitted into ${chunkedDocs.length} chunks`);

    console.log("⏳ Starting embedding process...");
    console.log("⚠️ TRUTH BOMB: Google's Free Tier strictly allows 100 chunks per minute.");
    console.log(`⚠️ Estimated time: ~${Math.ceil(chunkedDocs.length / 85)} minutes. Grab a coffee. ☕\n`);

    // Process 10 chunks at a time
    const batchSize = 10; 
    
    for (let i = 0; i < chunkedDocs.length; i += batchSize) {
      const batchDocs = chunkedDocs.slice(i, i + batchSize);
      
      const promises = batchDocs.map(async (doc, idx) => {
        try {
          // Ye wahi model hai jisne chunk 349 tak safely kaam kiya tha!
          const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: doc.pageContent,
            config: { outputDimensionality: 768 } // Forces Pinecone compatibility
          });
          
          return {
            id: `chunk_${i + idx}`,
            values: response.embeddings[0].values, 
            metadata: { text: doc.pageContent }
          };
        } catch (e) {
          console.error(`❌ Error embedding chunk ${i + idx}:`, e.message);
          return null;
        }
      });

      const batchVectors = (await Promise.all(promises)).filter(v => v !== null);
      
      if (batchVectors.length > 0) {
        await pineconeIndex.upsert(batchVectors);
        console.log(`✅ Progress: ${Math.min(i + batchSize, chunkedDocs.length)} / ${chunkedDocs.length} chunks uploaded.`);
      }

      // THE LIFESAVER: Wait exactly 7 seconds before the next batch.
      // 10 chunks / 7 seconds = ~85 chunks per minute. (Safely under 100 limit)
      await new Promise(resolve => setTimeout(resolve, 7000));
    }

    console.log("\n🚀 DATABASE BUILD COMPLETE! Your RAG is ready.");
  } catch (error) {
    console.error("❌ Fatal Error building database:", error);
  }
}

buildDatabase();