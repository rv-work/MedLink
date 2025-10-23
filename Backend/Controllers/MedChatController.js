import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

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
        Only output the rewritten question and nothing else.`
      }
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

// Mode 1: Internet Only
const getInternetOnly = async (req, res) => {
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
    
    history.push({
      role: 'user',
      parts: [{ text: transformedQuery }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: history,
      config: {
        systemInstruction: `You are a Medical Expert with access to comprehensive internet knowledge.
        Answer the user's medical question based on your general medical knowledge and the conversation history.
        Provide accurate, helpful, and educational information.
        Always remind users to consult healthcare professionals for personalized advice.
        If you're unsure about something, clearly state your uncertainty.`
      }
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
    console.error('Internet only error:', error);
    return res.status(500).json({ error: 'Failed to get internet answer' });
  }
};

// Mode 2: Book Only
const getBookOnly = async (req, res) => {
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
      model: 'text-embedding-004'
    });

    const queryVector = await embeddings.embedQuery(transformedQuery);
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true
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
        Context: ${context}`
      }
    });

    const rawAnswer = response.text;
    const easyAnswer = await simplifyAnswer(rawAnswer);

    if (isAnswerNotFound(rawAnswer)) {
      history.pop();
      return res.json({
        response: "📚 I couldn't find this information in my medical books. This question might need broader knowledge sources.",
        source: 'book',
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
        sessionId
      });
    }

  } catch (error) {
    console.error('Book only error:', error);
    return res.status(500).json({ error: 'Failed to get book answer' });
  }
};

// Mode 3: ML Diagnosis
const getMLDiagnosis = async (req, res) => {
  try {
    const { message, session_id, step, context } = req.body;

    if (!message || !session_id) {
      return res.status(400).json({
        error: 'Message and session_id are required'
      });
    }

    console.log('Proxying ML diagnosis request to Python service:', {
      message: message.substring(0, 50) + '...',
      session_id,
      step: step || 'symptom'
    });

    // Call Python ML service with timeout and retry logic
    let mlResponse;
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        mlResponse = await axios.post('https://medlink-chat.onrender.com/diagnose', {
          message: message,
          session_id: session_id,
          step: step || 'symptom',
          context: context || null
        }, {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        break; // Success, exit retry loop
      } catch (axiosError) {
        retryCount++;
        console.error(`ML service attempt ${retryCount} failed:`, axiosError.message);
        
        if (retryCount === maxRetries) {
          throw axiosError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return res.json({
      response: mlResponse.data.response,
      source: 'ml',
      step: mlResponse.data.step,
      context: mlResponse.data.context,
      completed: mlResponse.data.completed || false,
      sessionId: session_id
    });

  } catch (error) {
    console.error('ML diagnosis proxy error:', error);
    
    // Provide specific error messages
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML diagnosis service is not available. Please ensure the Python service is running on port 8000.' 
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        error: 'ML diagnosis service timed out. Please try again.' 
      });
    }

    return res.status(500).json({ 
      error: `ML diagnosis service error: ${error.message}` 
    });
  }
};


// Mode 4: Internet + Book (Original askQuestion function)
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
      model: 'text-embedding-004'
    });

    const queryVector = await embeddings.embedQuery(transformedQuery);
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true
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
        Context: ${context}`
      }
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

// MODIFIED Mode 5: Sequential Book → Internet with ML Context
const getAllCombined = async (req, res) => {
  try {
    const { question, sessionId, context } = req.body;
    
    if (!question || !sessionId) {
      return res.status(400).json({
        error: 'Question and sessionId are required'
      });
    }

    const history = getSessionHistory(sessionId);
    history.lastActivity = Date.now();
    
    const transformedQuery = await transformQuery(question, history);

    // STEP 1: Try book knowledge first with ML context
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004'
    });

    const queryVector = await embeddings.embedQuery(transformedQuery);
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true
    });

    const bookContext = searchResults.matches
      .map(match => match.metadata.text)
      .join('\n\n---\n\n');

    // Build ML diagnosis context if available
    let mlContextMessage = '';
    if (context && context.diagnosis_result) {
      const diagnosis = context.diagnosis_result;
      mlContextMessage = `PATIENT DIAGNOSIS CONTEXT:
      - Primary Condition: ${diagnosis.primary_disease}
      - Symptoms: ${diagnosis.symptoms ? diagnosis.symptoms.join(', ') : 'Not specified'}
      - Duration: ${diagnosis.duration_days} days
      - Severity Assessment: ${diagnosis.severity_assessment}
      ${diagnosis.secondary_disease ? `- Alternative Condition: ${diagnosis.secondary_disease}` : ''}
      
      The user is asking follow-up questions about their diagnosed condition.
      `;
    }

    history.push({
      role: 'user',
      parts: [{ text: transformedQuery }]
    });

    // Try book-only response first
    const bookOnlyResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: history,
      config: {
        systemInstruction: `You are a Medical Expert with access to patient diagnosis context and medical books.
        
        ${mlContextMessage}
        
        Answer the user's question based ONLY on:
        1. The patient's ML diagnosis context (if provided above)
        2. The medical book knowledge provided below
        
        If the answer is not available in the provided contexts, you must say EXACTLY: "I could not find the answer in the provided document."
        
        Medical Book Context: ${bookContext}`
      }
    });

    const rawBookAnswer = bookOnlyResponse.text;
    const easyBookAnswer = await simplifyAnswer(rawBookAnswer);

    // STEP 2: Check if book answer is sufficient
    if (isAnswerNotFound(rawBookAnswer)) {
      // Book answer not found - ask permission for internet
      history.pop(); // Remove user question temporarily
      
      return res.json({
        response: "📚 I couldn't find complete information about this in my medical books. Would you like me to search using internet knowledge for more details?",
        source: 'book',
        needsPermission: true,
        sessionId,
        mlContext: context // Pass ML context for internet response
      });
    } else {
      // Book answer is sufficient
      history.push({
        role: 'model',
        parts: [{ text: easyBookAnswer }]
      });

      return res.json({
        response: easyBookAnswer,
        source: 'book',
        needsPermission: false,
        sessionId
      });
    }

  } catch (error) {
    console.error('All combined error:', error);
    return res.status(500).json({ error: 'Failed to get combined answer' });
  }
};

// NEW: Internet answer with ML context (for Mode 5 permission granted)
const getAllCombinedInternet = async (req, res) => {
  try {
    const { question, sessionId, mlContext } = req.body;
    
    if (!question || !sessionId) {
      return res.status(400).json({
        error: 'Question and sessionId are required'
      });
    }

    const history = getSessionHistory(sessionId);
    const transformedQuery = await transformQuery(question, history);

    // Build ML diagnosis context
    let mlContextMessage = '';
    if (mlContext && mlContext.diagnosis_result) {
      const diagnosis = mlContext.diagnosis_result;
      mlContextMessage = `PATIENT DIAGNOSIS CONTEXT:
      - Primary Condition: ${diagnosis.primary_disease}
      - Symptoms: ${diagnosis.symptoms ? diagnosis.symptoms.join(', ') : 'Not specified'}
      - Duration: ${diagnosis.duration_days} days
      - Severity Assessment: ${diagnosis.severity_assessment}
      ${diagnosis.secondary_disease ? `- Alternative Condition: ${diagnosis.secondary_disease}` : ''}
      
      The user is asking follow-up questions about their diagnosed condition.
      `;
    }

    // Add user question to history if not already there
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
        systemInstruction: `You are a comprehensive Medical Expert with access to patient diagnosis context and internet knowledge.
        
        ${mlContextMessage}
        
        Answer the user's question using:
        1. The patient's ML diagnosis context (if provided above) - prioritize this for personalized advice
        2. Your comprehensive medical knowledge and internet resources
        
        Provide helpful, educational responses while reminding users to consult healthcare professionals for serious concerns.
        Make sure to reference their diagnosed condition when relevant.`
      }
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
    console.error('All combined internet error:', error);
    return res.status(500).json({ error: 'Failed to get internet answer with context' });
  }
};

// Existing functions
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
        Context: You have access to comprehensive medical knowledge. Use this to provide detailed, educational responses.`
      }
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

export { 
  askQuestion, 
  getInternetAnswer, 
  clearHistory,
  getInternetOnly,
  getBookOnly,
  getAllCombined,
  getAllCombinedInternet, 
  getMLDiagnosis
};
