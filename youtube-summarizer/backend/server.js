require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const { getYoutubeTranscript } = require('./services/youtubeService');
const { summarizeText } = require('./services/openaiService');
const { generateSpeech } = require('./services/ttsService');
const { generateTextToVideo } = require('./services/ttvService');
const { mapTranscriptForGrid } = require('./uitls/transcriptGridHelper')
const path = require('path');

const app = express();
const PORT = process.env.REACT_APP_PORT || 5000;

const corsOptions = {
  origin: 'https://quick-tuber-frontend.onrender.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.post(
  '/api/summarize',
  [
    body('url').isURL().withMessage('Valid YouTube URL is required'),
    body('options').optional().isObject().withMessage('Options must be an object'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url, options = {} } = req.body;

      console.log(`Processing video: ${url}`);

      const transcript = await getYoutubeTranscript(url);
      console.log('Transcript:', transcript);
      if (!transcript || transcript.length === 0) {
        return res.status(404).json({ error: 'Transcript not available for this video' });
      }

      const formattedTranscript = mapTranscriptForGrid(transcript);
      const fullText = transcript.map(segment => segment.text).join(' ');
      const summary = await summarizeText(fullText, {
        maxLength: options.maxLength || 12000,
        language: options.language || 'English',
      });
      
      const audioData = await generateSpeech(summary, url);
      const base64Audio = audioData.toString('base64');
      res.json({
        success: true,
        transcript: formattedTranscript,
        summary: summary,
        audio_url: `data:audio/mpeg;base64,${base64Audio}`,
        metadata: {
          length: fullText.length,
          language: options.language || 'English',
          summaryLength: summary.length,
        },
      });
    } catch (error) {
      console.error('Error processing request:', error);
      const statusCode = error.message.includes('15 minute') ? 413 : 500;
      res.status(statusCode).json({
        error: error.message,
        details: statusCode === 413 
          ? 'Video exceeds maximum allowed duration (15 minutes)'
          : 'Internal server error',
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post(
  '/api/videoSummary',
  [
    body('text').isString().notEmpty().withMessage('Summary text is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { text } = req.body;

      console.log('Generating video summary...');
      const videoUrl = await generateTextToVideo(text);

      res.json({
        success: true,
        video: videoUrl,
        metadata: {
          textLength: text.length,
        },
      });
    } catch (error) {
      console.error('Error generating video summary:', error);
      res.status(500).json({
        error: error.message,
        details: 'Failed to generate video summary',
      });
    }
  }
);