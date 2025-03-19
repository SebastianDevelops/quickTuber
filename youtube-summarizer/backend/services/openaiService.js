const { Configuration, OpenAIApi } = require("azure-openai");

const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
const deploymentName = 'gpt-4o';

const configuration = new Configuration({
  azure: {
    apiKey: apiKey,
    endpoint: endpoint,
    deploymentName: deploymentName
  }
});

let client;
try {
  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI credentials are not properly configured');
  }
  client = new OpenAIApi(configuration);
} catch (error) {
  console.error('Failed to initialize Azure OpenAI client:', error);
  throw error;
}

/**
 * Summarizes YouTube transcript using Azure OpenAI's GPT model
 * 
 * @param {string} transcript - The full transcript text
 * @param {object} [options] - Optional parameters
 * @param {number} [options.maxLength=12000] - Max characters to process
 * @param {string} [options.language='English'] - Target summary language
 * @returns {Promise<string>} - Concise summary
 */
async function summarizeText(transcript, options = {}) {
  const { maxLength = 12000, language = 'English' } = options;

  try {
        const cleanText = transcript
      .replace(/\n+/g, " ")                    // Replace newlines with spaces
      .replace(/\s+/g, " ")                    // Normalize multiple spaces
      .replace(/\[.*?\]/g, "")                // Remove square bracket content like [Music]
      .replace(/\(.*?\)/g, "")                // Remove parenthetical content
      .replace(/[^\w\s.,!?-]/g, "")           // Remove special characters except basic punctuation
      .replace(/\s+([.,!?])/g, "$1")          // Fix spacing before punctuation
      .replace(/([.,!?])(?=[^\s])/g, "$1 ")   // Fix spacing after punctuation
      .substring(0, maxLength)
      .trim();

    const response = await client.createChatCompletion({
      model: deploymentName,
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes YouTube videos." },
        { role: "user", content: `Create a concise summary in ${language} of this video transcript. 
                  Focus on key points and main ideas. Use clear paragraphs.
                  Transcript: ${cleanText}` }
      ],
      max_tokens: 500,
      temperature: 0.2,
      top_p: 0.9,
      stop: null
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Summarization error:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

module.exports = { summarizeText };