const ytdl = require("@distube/ytdl-core");
const { OpenAI } = require('openai');
const fs = require('fs');
const axios = require('axios');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

const options = {
  method: 'GET',
  url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
  params: {
    videoId: ''
  },
  headers: {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
  }
};
const MAX_DURATION = 15;

async function getYoutubeTranscript(url) {
  try {
    const videoId = parseVideoId(url);
    const videoDetails = await getVideoDetails(videoId);
    const duration = videoDetails.lengthSeconds / 60;
    const subtitlesUrl = videoDetails.subtitles.items[0].url;

    if (duration > MAX_DURATION) {
      throw new Error(`Video exceeds 15 minute limit (${Math.round(duration)}m)`);
    }

    if(!subtitlesUrl)
    {
      throw new Error('No subtitles available for this video');
    }

    return await getGenTranscript(subtitlesUrl);
  } catch (error) {
    if (error.message.includes('exceeds 15 minute limit')) throw error;
    console.error('Primary method failed:', error.message);
  }
}

function parseVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const matches = url.match(regex);
  return matches ? matches[1] : null;
}

async function getVideoDetails(videoId) {
  try {
    options.params.videoId = videoId;

    const response = await axios.request(options);

    return response.data;
  } catch (error) {
    console.error('Getting video details failed:', error.message);
    throw new Error(`Could not get video details: ${error.message}`);
  }
}

async function getGenTranscript(subtitlesUrl) {
  const transcriptOptions = {
    method: 'GET',
    url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/subtitles',
    params: {
      subtitleUrl: subtitlesUrl, 
      format: 'json'
    },
    headers: {
      'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
      'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
    }
  };
  try {
    const response = await axios.request(transcriptOptions);
    return response.data;
  } catch (error) {
    throw error.message.includes('exceeds') ? error : 
      new Error('Transcription failed: ' + error.message);
  }
}

module.exports = { getYoutubeTranscript };