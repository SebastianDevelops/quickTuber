import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { saveAs } from 'file-saver';

interface SummaryAudioTabProps {
  audioUrl: string;
  transcript: any[];
  formatTimestamp: (offset: number) => string;
}

const SummaryAudioTab = React.forwardRef<HTMLAudioElement, SummaryAudioTabProps>(
  ({ audioUrl, transcript, formatTimestamp }, ref) => {

    const handleExportTranscript = () => {
      const transcriptText = transcript.map(t => 
        `[${formatTimestamp(t.offset)}] ${t.text}`
      ).join('\n');
      const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'transcript.txt');
    };

    return (
      <div className="summary-audio-tab">
        <Card className="audio-card">
          <CardBody>
            <h2>Audio Summary</h2>
            <div className="audio-player-container">
              {audioUrl && (
                <audio ref={ref} controls className="audio-element">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support audio playback
                </audio>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
);

export default SummaryAudioTab;