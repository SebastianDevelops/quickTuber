/**
 * Formats milliseconds into a "minutes:seconds" string.
 * @param {number} milliseconds - Time in milliseconds.
 * @returns {string} - Formatted time string.
 */
function formatTimestamp(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Maps transcript segments to an array suitable for KendoReact Grid.
   * @param {Array} transcriptArray - Array of transcript segments.
   * @returns {Array} - Array with formatted time and text.
   */
  function mapTranscriptForGrid(transcriptArray) {
    console.log('transcriptArray:', transcriptArray);
    return transcriptArray.map(segment => ({
      offset: segment.startMs,
      formattedTime: formatTimestamp(segment.startMs),
      text: segment.text
    }));
  }

  module.exports = { mapTranscriptForGrid };