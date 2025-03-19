import React, { useState, useRef } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardActions,
} from "@progress/kendo-react-layout";
import { Loader } from "@progress/kendo-react-indicators";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import { Fade } from "@progress/kendo-react-animation";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Switch } from "@progress/kendo-react-inputs";
import "@progress/kendo-theme-default/dist/all.css";
import "./App.css";
import SummaryTextTab from "./components/SummaryTextTab";
import SummaryAudioTab from "./components/SummaryAudioTab";
import SummaryVideoTab from "./components/SummaryVideoTab";

import { API_BASE_URL } from "./config";

function App() {
  // State management
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "info" | "error" | "none" | "success" | "warning"
  >("info");
  const [selectedTab, setSelectedTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const audioRef = useRef(null);

  // Handle URL input change
  const handleUrlChange = (e: any) => {
    setUrl(e.target.value);
  };

  // Validate YouTube URL
  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubeUrlPattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
    return youtubeUrlPattern.test(url);
  };

  // Show notification
  const showMessage = (
    message: React.SetStateAction<string>,
    type: "info" | "error" | "none" | "success" | "warning" = "info"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Validate URL
    if (!isValidYoutubeUrl(url)) {
      showMessage("Please enter a valid YouTube URL", "error");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize video");
      }

      // Update state with response data
      setTranscript(data.transcript);
      setSummary(data.summary);
      setAudioUrl(data.audio_url);
      setSelectedTab(1); // Switch to Summary tab
      showMessage("Video successfully summarized!", "success");
    } catch (error) {
      setError((error as any).message);
      showMessage((error as any).message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab selection
  const handleTabSelect = (e: { selected: React.SetStateAction<number> }) => {
    setSelectedTab(e.selected);
  };

  // Format timestamp for transcript grid
  const formatTimestamp = (offset: number) => {
    const totalSeconds = Math.floor(offset / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <NotificationGroup>
        <Fade enter={true} exit={true}>
          {showNotification && (
            <Notification
              type={{ style: notificationType }}
              closable={true}
              onClose={() => setShowNotification(false)}
            >
              <span>{notificationMessage}</span>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>

      <Card className="main-card">
        <CardHeader>
          <CardTitle>
            <div className="app-header">
              <img
                src="logo-white.png"
                alt="QuickTube Logo"
                className="app-logo"
              />
              <h1>QuickTube</h1>
            </div>
          </CardTitle>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="url-form">
            <div className="input-group">
              <Input
                placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                value={url}
                onChange={handleUrlChange}
                disabled={isLoading}
                className="url-input"
              />
              <Button
                type="submit"
                themeColor="primary"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? <Loader size="small" /> : "Summarize"}
              </Button>
            </div>
          </form>

          {isLoading ? (
            <div className="loader-container">
              <Loader size="large" type="infinite-spinner" />
              <p>Processing your video. This may take a minute...</p>
            </div>
          ) : (
            <>
              {summary && (
                <TabStrip
                  selected={selectedTab}
                  onSelect={handleTabSelect}
                  className="tab-strip"
                >
                  <TabStripTab title="Transcript">
                    <div className="grid-container">
                      <Grid
                        data={transcript.map((item: any) => ({
                          ...item,
                          formattedTime: formatTimestamp(item.offset),
                        }))}
                      >
                        <GridColumn
                          field="formattedTime"
                          title="Time"
                          width="100px"
                        />
                        <GridColumn field="text" title="Text" />
                      </Grid>
                    </div>
                  </TabStripTab>

                  <TabStripTab title="Text Summary">
                    <SummaryTextTab summary={summary} />
                  </TabStripTab>

                  {audioUrl && (
                    <TabStripTab title="Audio Summary">
                      <SummaryAudioTab
                        ref={audioRef}
                        audioUrl={audioUrl}
                        transcript={transcript}
                        formatTimestamp={formatTimestamp}
                      />
                    </TabStripTab>
                  )}

                  <TabStripTab title="Video Summary(Preview)">
                    <SummaryVideoTab summary={summary} audioRef={audioRef} videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
                  </TabStripTab>
                </TabStrip>
              )}
            </>
          )}
        </CardBody>

        <CardActions>
          <div className="card-footer">
            <p>Enter a YouTube URL and click "Summarize" to get started.</p>
          </div>
        </CardActions>
      </Card>
    </div>
  );
}

export default App;
