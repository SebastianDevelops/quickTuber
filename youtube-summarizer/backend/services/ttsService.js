const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { promisify } = require('util');

async function generateWithDeepgram(text) {
  const apiKey = process.env.REACT_APP_DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    throw new Error('Deepgram API key not configured');
  }

  const deepgram = createClient(apiKey);
  const response = await deepgram.speak.request(
    { text },
    {
      model: 'aura-helios-en',
    }
  );

  const webStream = await response.getStream();
  const nodeStream = Readable.fromWeb(webStream);

  const chunks = [];
  for await (const chunk of nodeStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function generateSpeech(text, videoId) {
  try {
    await ensureAudioDirectoryExists();

    const filename = generateFriendlyFilename(videoId);
    const filepath = path.join(__dirname, 'audio', filename);

    return audioData = await generateWithDeepgram(text);

    throw new Error('Failed to generate audio data');
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech from text');
  }
}

function generateFriendlyFilename(videoId) {
  const id = videoId.replace(/^.*(v=|youtu\.be\/)/, '').replace(/[^a-zA-Z0-9_-]/g, '');
  return `summary-${id}.mp3`;
}

async function ensureAudioDirectoryExists() {
  const audioDir = path.join(__dirname, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
}

module.exports = {
  generateSpeech
};