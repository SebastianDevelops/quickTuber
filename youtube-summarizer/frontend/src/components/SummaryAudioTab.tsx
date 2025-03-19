import React from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';

interface SummaryAudioTabProps {
  audioUrl: string;
  transcript: any[];
  formatTimestamp: (offset: number) => string;
}

const SummaryAudioTab = React.forwardRef<HTMLAudioElement, SummaryAudioTabProps>(
  ({ audioUrl, transcript, formatTimestamp }, ref) => {
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