const ytdl = require("@distube/ytdl-core");
const { OpenAI } = require('openai');
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

const openai = new OpenAI({ apiKey: process.env.REACT_APP_WHISPER_API_KEY });
const MAX_DURATION = 15 * 60;

async function getYoutubeTranscript(url) {
  try {
    const duration = await getVideoDuration(url);
    
    if (duration > MAX_DURATION) {
      throw new Error(`Video exceeds 15 minute limit (${Math.round(duration/60)}m)`);
    }

    return await getTranscriptWithWhisperSDK(url);
  } catch (error) {
    if (error.message.includes('exceeds 15 minute limit')) throw error;
    console.error('Primary method failed:', error.message);
  }
}

async function getVideoDuration(url) {
  try {
    ytdl.getBasicInfo(url).then(info => {

      if (!info.videoDetails.lengthSeconds) {
        throw new Error('Duration not available for this video');
      }
      console.log('Duration:', info.videoDetails.lengthSeconds);
      return parseInt(info.videoDetails.lengthSeconds);
    });
  } catch (error) {
    console.error('Duration check failed:', error.message);
    throw new Error(`Could not verify video duration: ${error.message}`);
  }
}

async function getTranscriptWithWhisperSDK(url) {
  let tempFilePath;
  try {
    const audioStream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });

    const duration = await getVideoDuration(url);
    if (duration > MAX_DURATION) {
      throw new Error(`Video exceeds 15 minute limit (${Math.round(duration/60)}m)`);
    }
    var videoTitle;
    ytdl.getBasicInfo(url).then(info => {
      videoTitle = info.videoDetails.title;
    });
    tempFilePath = `./temp_${videoTitle}.mp3`;
    await pipeline(audioStream, fs.createWriteStream(tempFilePath));

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      response_format: "verbose_json",
    });

    console.log('Transcription:', transcription);

    return transcription.segments.map(segment => ({
      text: segment.text,
      offset: segment.start * 1000,
      duration: (segment.end - segment.start) * 1000
    }));
  } catch (error) {
    console.error('Whisper Error:', error);
    throw error.message.includes('exceeds') ? error : 
      new Error('Transcription failed: ' + error.message);
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

module.exports = { getYoutubeTranscript };