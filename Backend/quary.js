import * as dotenv from 'dotenv';
dotenv.config();
import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const History = []

async function transformQuery(question){
    History.push({
        role:'user',
        parts:[{text:question}]
    })  

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
        config: {
            systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
            Only output the rewritten question and nothing else.`,
        },
    });
    
    History.pop()
    return response.text
}

function isAnswerNotFound(response) {
    const notFoundPhrases = [
        "I could not find the answer in the provided document",
        "not found in the context",
        "information is not available in the provided context",
        "answer is not in the context",
        "document does not provide",
        "document doesn't provide",
        "not provided in the document",
        "document does not contain",
        "document doesn't contain",
        "not mentioned in the document",
        "document does not specify",
        "information is not provided",
        "details are not provided",
        "specific details are not provided",
        "I am sorry, but the document does not",
        "sorry, but the document does not",
        "document only mentions"
    ];
    
    return notFoundPhrases.some(phrase => 
        response.toLowerCase().includes(phrase.toLowerCase())
    );
}

async function getInternetAnswer(question) {
    const internetHistory = [...History]; 
    internetHistory.push({
        role: 'user',
        parts: [{text: question}]
    });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: internetHistory,
        config: {
            systemInstruction: `You are a Medical Expert with access to general medical knowledge.
            Answer the user's medical question based on your general medical knowledge and the conversation history.
            Provide accurate, helpful, and educational information.
            Always remind users to consult healthcare professionals for personalized advice.
            If you're unsure about something, clearly state your uncertainty.
            
            Context: You have access to comprehensive medical knowledge. Use this to provide detailed, educational responses.`,
        },
    });
    
    return response.text;
}

async function chatting(question) {
    try {
        const queries = await transformQuery(question);

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: 'text-embedding-004',
        });
        
        const queryVector = await embeddings.embedQuery(queries); 

        // Make connection with pinecone
        const pinecone = new Pinecone();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

        const searchResults = await pineconeIndex.query({
            topK: 10,
            vector: queryVector,
            includeMetadata: true,
        });

        const context = searchResults.matches
                           .map(match => match.metadata.text)
                           .join("\n\n---\n\n");

        // Try to get answer from book data first
        History.push({
            role:'user',
            parts:[{text:queries}]
        })  

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: History,
            config: {
                systemInstruction: `You have to behave like a Medical Expert.
                You will be given a context of relevant information and a user question.
                Your task is to answer the user's question based ONLY on the provided context.
                If the answer is not in the context or if the context doesn't contain sufficient information to answer the question completely, you must say EXACTLY: "I could not find the answer in the provided document."
                Keep your answers clear, concise, and educational.
                
                Context: ${context}`,
            },
        });

        // Check if answer was found in book
        if (isAnswerNotFound(response.text)) {
            console.log("\n📚 Book Response:");
            console.log(response.text);
            console.log("\n" + "=".repeat(50));
            
            // Ask user if they want internet answer
            const userChoice = readlineSync.question(
                "\n🌐 Kya main apni general medical knowledge se answer dun? (y/n): "
            );
            
            if (userChoice.toLowerCase() === 'y' || userChoice.toLowerCase() === 'yes') {
                console.log("\n🌐 Internet/General Knowledge Answer:");
                console.log("⏳ Searching from general knowledge...\n");
                
                const internetAnswer = await getInternetAnswer(queries);
                console.log(internetAnswer);
                
                // Add the internet answer to history
                History.push({
                    role:'model',
                    parts:[{text: internetAnswer}]
                });
                
                console.log("\n⚠️  Note: Ye answer general medical knowledge se hai. Personalized advice ke liye doctor se consult kariye.");
            } else {
                console.log("\n❌ Okay, koi aur question puch sakte hain.");
                // Add the book response to history
                History.push({
                    role:'model',
                    parts:[{text:response.text}]
                });
            }
        } else {
            // Answer found in book
            console.log("\n📚 Book Answer:");
            History.push({
                role:'model',
                parts:[{text:response.text}]
            });
            console.log(response.text);
        }

    } catch (error) {
        console.error("❌ Error occurred:", error.message);
        console.log("Kripya phir se try kariye.");
    }
}

async function main(){
    console.log("🏥 Medical Expert Chat Bot");
    console.log("=" .repeat(30));
    console.log("📝 Tip: 'exit' likhkar quit kar sakte hain\n");
    
    while (true) {
        const userProblem = readlineSync.question("❓ Ask me anything --> ");
        
        if (userProblem.toLowerCase() === 'exit') {
            console.log("👋 Goodbye! Take care of your health!");
            break;
        }
        
        await chatting(userProblem);
        console.log("\n" + "-".repeat(60) + "\n");
    }
}

main().catch(console.error);