import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const sessionHistories = new Map();

const getSessionHistory = (sessionId) => {
  if (!sessionHistories.has(sessionId)) {
    sessionHistories.set(sessionId, []);
  }
  return sessionHistories.get(sessionId);
};

const cleanupOldSessions = () => {
  const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); 
  for (const [sessionId, history] of sessionHistories.entries()) {
    const lastActivity = history.lastActivity || 0;
    if (lastActivity < cutoffTime) {
      sessionHistories.delete(sessionId);
    }
  }
};

setInterval(cleanupOldSessions, 60 * 60 * 1000);

// ----------------- Simplification Step -----------------
async function simplifyAnswer(originalAnswer) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are an expert at explaining complex medical information to normal people.
          Rewrite the following answer in very simple, everyday language so that even a non-medical person can understand.
          Use short sentences. Avoid medical jargon unless absolutely necessary, and if you use it, explain it.
          Add small, practical examples to make it easier to understand.

          Original Answer:
          ${originalAnswer}`
        }]
      }]
    });

    return response.text;
  } catch (error) {
    console.error('Error simplifying answer:', error);
    return originalAnswer;
  }
}
// --------------------------------------------------------

async function transformQuery(question, history) {
  const tempHistory = [...history];
  tempHistory.push({
    role: 'user',
    parts: [{ text: question }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: tempHistory,
      config: {
        systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
        Only output the rewritten question and nothing else.`,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error('Error transforming query:', error);
    return question; 
  }
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

const askQuestion = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || !sessionId) {
      return res.status(400).json({
        error: 'Question and sessionId are required'
      });
    }

    const history = getSessionHistory(sessionId);
    history.lastActivity = Date.now();

    const transformedQuery = await transformQuery(question, history);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    });
    
    const queryVector = await embeddings.embedQuery(transformedQuery);

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .map(match => match.metadata.text)
      .join('\n\n---\n\n');

    history.push({
      role: 'user',
      parts: [{ text: transformedQuery }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: history,
      config: {
        systemInstruction: `You have to behave like a Medical Expert.
        You will be given a context of relevant information and a user question.
        Your task is to answer the user's question based ONLY on the provided context.
        If the answer is not in the context or if the context doesn't contain sufficient information to answer the question completely, you must say EXACTLY: "I could not find the answer in the provided document."
        Keep your answers clear, concise, and educational.
        
        Context: ${context}`,
      },
    });

    const rawAnswer = response.text;
    const easyAnswer = await simplifyAnswer(rawAnswer);

    if (isAnswerNotFound(rawAnswer)) {
      history.pop();
      return res.json({
        response: easyAnswer,
        source: 'book',
        needsPermission: true,
        sessionId
      });
    } else {
      history.push({
        role: 'model',
        parts: [{ text: easyAnswer }]
      });
      return res.json({
        response: easyAnswer,
        source: 'book',
        needsPermission: false,
        sessionId
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

const getInternetAnswer = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question || !sessionId) {
      return res.status(400).json({
        error: 'Question and sessionId are required'
      });
    }

    const history = getSessionHistory(sessionId);
    const transformedQuery = await transformQuery(question, history);
    
    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      history.push({
        role: 'user',
        parts: [{ text: transformedQuery }]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: history,
      config: {
        systemInstruction: `You are a Medical Expert with access to general medical knowledge.
        Answer the user's medical question based on your general medical knowledge and the conversation history.
        Provide accurate, helpful, and educational information.
        Always remind users to consult healthcare professionals for personalized advice.
        If you're unsure about something, clearly state your uncertainty.
        
        Context: You have access to comprehensive medical knowledge. Use this to provide detailed, educational responses.`,
      },
    });

    const rawAnswer = response.text;
    const easyAnswer = await simplifyAnswer(rawAnswer);

    history.push({
      role: 'model',
      parts: [{ text: easyAnswer }]
    });

    return res.json({
      response: easyAnswer,
      source: 'internet',
      sessionId
    });

  } catch (error) {
    console.error('Internet answer error:', error);
    return res.status(500).json({ error: 'Failed to get internet answer' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (sessionHistories.has(sessionId)) {
      sessionHistories.delete(sessionId);
    }

    return res.json({
      message: 'History cleared successfully',
      sessionId
    });

  } catch (error) {
    console.error('Clear history error:', error);
    return res.status(500).json({ error: 'Failed to clear history' });
  }
};

export { askQuestion, getInternetAnswer, clearHistory };
