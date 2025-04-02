# React TS HLS Player

A lightweight and flexible React component for playing HLS (HTTP Live Streaming) videos using [hls.js](https://github.com/video-dev/hls.js/).

## Features

- 🚀 Easy to use with minimal configuration
- 🔄 Direct access to the underlying video element and hls.js instance
- 📱 Full support for all HTML5 video attributes and events
- 🛠️ Customizable hls.js configuration
- 📺 Quality selection and adaptive streaming support
- 💪 Written in TypeScript with complete type definitions
- 🌐 Cross-browser compatible (with fallback for Safari's native HLS support)
- 🔧 Error recovery mechanisms

## Installation

```bash
npm install react-ts-hls-player hls.js
# or
yarn add react-ts-hls-player hls.js
```

## Basic Usage

```jsx
import HlsPlayer from "react-ts-hls-player";

const App = () => {
  return (
    <HlsPlayer
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      autoPlay={false}
      controls={true}
      width="100%"
      height="auto"
    />
  );
};

export default App;
```

## Advanced Usage

### Customizing HLS Configuration

```jsx
import HlsPlayer from "react-ts-hls-player";

const App = () => {
  // Define HLS configuration
  const hlsConfig = {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
  };

  return (
    <HlsPlayer
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      hlsConfig={hlsConfig}
      autoPlay={false}
      controls={true}
      width="100%"
      height="auto"
    />
  );
};

export default App;
```

### Using Refs for Direct Access

```jsx
import { useRef, useState } from "react";
import HlsPlayer from "react-ts-hls-player";

const App = () => {
  // Create a ref to access the player
  const playerRef = useRef({
    video: null,
    hls: null,
  });

  const [currentLevel, setCurrentLevel] = useState(0);
  const [levels, setLevels] = useState([]);

  // Handle HLS ready event
  const handleHlsReady = (hls, video) => {
    console.log("HLS player is ready");

    // Get available quality levels
    if (hls.levels && hls.levels.length > 0) {
      setLevels(hls.levels);
      setCurrentLevel(hls.currentLevel);
    }
  };

  // Handle quality change
  const handleQualityChange = (level) => {
    if (playerRef.current?.hls) {
      playerRef.current.hls.currentLevel = level;
      setCurrentLevel(level);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    const video = playerRef.current?.video;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  return (
    <div>
      <HlsPlayer
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        playerRef={playerRef}
        onHlsReady={handleHlsReady}
        autoPlay={false}
        controls={true}
      />

      <div className="custom-controls">
        <button onClick={togglePlayPause}>Play/Pause</button>

        {levels.length > 0 && (
          <select
            value={currentLevel}
            onChange={(e) => handleQualityChange(parseInt(e.target.value))}
          >
            <option value="-1">Auto</option>
            {levels.map((level, index) => (
              <option key={index} value={index}>
                {level.height}p ({Math.round(level.bitrate / 1000)} kbps)
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default App;
```

### Handling HLS Events

```jsx
import HlsPlayer from "react-ts-hls-player";

const App = () => {
  const handleHlsError = (error, data) => {
    console.error("HLS Error:", error, data);
  };

  const handleHlsManifestParsed = (data) => {
    console.log(
      "Manifest parsed, found " + data.levels.length + " quality levels"
    );
  };

  const handleHlsLevelSwitched = (level) => {
    console.log("Quality changed to level " + level);
  };

  return (
    <HlsPlayer
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      autoPlay={false}
      controls={true}
      width="100%"
      height="auto"
      onHlsError={handleHlsError}
      onHlsManifestParsed={handleHlsManifestParsed}
      onHlsLevelSwitched={handleHlsLevelSwitched}
    />
  );
};

export default App;
```

## API Reference

### Props

| Prop                | Type                    | Required | Description                                                |
| ------------------- | ----------------------- | -------- | ---------------------------------------------------------- |
| src                 | string                  | Yes      | URL of the HLS stream (.m3u8 file)                         |
| hlsConfig           | object                  | No       | Configuration options for hls.js                           |
| playerRef           | RefObject<HlsPlayerRef> | No       | Reference for accessing the video element and hls instance |
| onHlsInit           | function                | No       | Called when hls.js is initialized                          |
| onHlsReady          | function                | No       | Called when hls.js is ready and media is attached          |
| onHlsError          | function                | No       | Called when hls.js encounters an error                     |
| onHlsMediaAttached  | function                | No       | Called when media is attached to hls.js                    |
| onHlsManifestParsed | function                | No       | Called when the manifest is parsed                         |
| onHlsLevelSwitched  | function                | No       | Called when the quality level is switched                  |

Plus all standard HTML5 video element attributes (autoPlay, controls, loop, etc.) and events (onPlay, onPause, onEnded, etc.).

### Type Definitions

```typescript
interface HlsConfig {
  autoStartLoad?: boolean;
  startPosition?: number;
  defaultAudioCodec?: string;
  debug?: boolean;
  maxBufferLength?: number;
  // ... and more hls.js options
  [key: string]: any;
}

interface HlsPlayerRef {
  video: HTMLVideoElement | null;
  hls: Hls | null;
}

interface HlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  hlsConfig?: HlsConfig;
  playerRef?: React.RefObject<HlsPlayerRef>;
  // ... HLS event handlers
}
```

## Browser Support

This component works in all browsers that support HTML5 video and MSE (Media Source Extensions). For browsers that natively support HLS (like Safari), the component will use the built-in HLS playback capabilities.

## License

MIT
