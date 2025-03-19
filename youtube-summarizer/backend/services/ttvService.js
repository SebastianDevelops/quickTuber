const Creatomate = require('creatomate');

const url = 'https://api.creatomate.com/v1/renders';
const apiKey = process.env.REACT_APP_TTV_API_KEY;

const client = new Creatomate.Client(apiKey);

async function generateTextToVideo(text)
{
    try{
        if(!text)
            {
                throw new Error("No summary text was provided.");
            }
        
            const data = {
                "template_id": "9d0c0c77-cf80-4ac3-adf8-cc1d6db9297c",
                "modifications": {
                  "Title.text": "Summary",
                  "Message.text": text
                }
              };

              const renders = await client.render(data);
            console.log("Completed", renders);

            return renders[0].url;
    }catch(error){
        console.error('Error generating video:', error);
        throw new Error('Failed to generate video summary');
    }
    
}

module.exports = {
    generateTextToVideo
  };