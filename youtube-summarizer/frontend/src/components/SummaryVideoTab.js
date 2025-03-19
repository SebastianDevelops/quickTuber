import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Loader } from '@progress/kendo-react-indicators';
import { API_BASE_URL } from '../config';

const SummaryVideoTab = ({ summary, audioRef, videoUrl, setVideoUrl }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/videoSummary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: summary }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setVideoUrl(data.video);
    } catch (error) {
      setError(error.message);
      console.error('Error generating video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoPlayPause = () => {
    if (!audioRef.current) {
      console.warn('Audio ref not available yet');
      return;
    }
    if (videoRef.current && audioRef.current) {
      if (videoRef.current.paused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('play', handleVideoPlayPause);
      videoRef.current.addEventListener('pause', handleVideoPlayPause);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', handleVideoPlayPause);
        videoRef.current.removeEventListener('pause', handleVideoPlayPause);
      }
    };
  }, [videoRef.current, audioRef.current]);

  return (
    <div className="summary-video-tab">
      <Card className="video-card">
        <CardBody>
          <h2>Video Summary</h2>
          {!videoUrl && !isLoading && (
            <Button
              onClick={handleGenerateVideo}
              themeColor="primary"
              disabled={isLoading}
              className="generate-video-button"
            >
              Generate Video Summary
            </Button>
          )}

          {isLoading && (
            <div className="loader-container">
              <Loader size="medium" type="infinite-spinner" />
              <p>Generating video summary, this might take a while...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}

          {videoUrl && (
            <div className="video-container">
              <video
                ref={videoRef}
                controls
                autoPlay
                loop
                className="video-player"
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support video playback
              </video>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SummaryVideoTab;