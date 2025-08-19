import * as dotenv from 'dotenv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

dotenv.config();

const PDF_PATH = './MedData.pdf';
const pdfLoader = new PDFLoader(PDF_PATH);
const rawDocs = await pdfLoader.load();
console.log("loaded");

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
console.log("splitted");

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });

  
console.log("embedding ready" );

const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

console.log("done");
