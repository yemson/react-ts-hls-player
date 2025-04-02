import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

// HlsConfig type definition
export interface HlsConfig {
  /**
   * Configuration options for hls.js
   * For a complete list of options, refer to the hls.js documentation:
   * https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
   */
  autoStartLoad?: boolean;
  startPosition?: number;
  defaultAudioCodec?: string;
  debug?: boolean;
  maxBufferLength?: number;
  maxMaxBufferLength?: number;
  maxBufferSize?: number;
  maxBufferHole?: number;
  lowLatencyMode?: boolean;
  [key: string]: any; // Other supported hls.js options
}

// Reference type for accessing the HlsPlayer instance
export interface HlsPlayerRef {
  video: HTMLVideoElement | null;
  hls: Hls | null;
}

// Props type definition
export interface HlsPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /**
   * HLS stream URL (required)
   */
  src: string;

  /**
   * hls.js configuration options
   */
  hlsConfig?: HlsConfig;

  /**
   * Reference object for accessing the player externally
   */
  playerRef?: React.RefObject<HlsPlayerRef>;

  /**
   * Called when hls.js is initialized
   */
  onHlsInit?: (hls: Hls) => void;

  /**
   * Called when the HLS object is created and ready
   */
  onHlsReady?: (hls: Hls, video: HTMLVideoElement) => void;

  /**
   * Called when an error occurs
   */
  onHlsError?: (error: any, data: any) => void;

  /**
   * Called when media is attached
   */
  onHlsMediaAttached?: () => void;

  /**
   * Called when the manifest is parsed
   */
  onHlsManifestParsed?: (data: any) => void;

  /**
   * Called when the quality level is switched
   */
  onHlsLevelSwitched?: (level: number) => void;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({
  src,
  hlsConfig = {},
  playerRef,
  onHlsInit,
  onHlsReady,
  onHlsError,
  onHlsMediaAttached,
  onHlsManifestParsed,
  onHlsLevelSwitched,
  autoPlay,
  ...props
}) => {
  // Reference to the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // Reference to the HLS instance
  const hlsRef = useRef<Hls | null>(null);

  // Create internal playerRef (used when no external ref is provided)
  const internalPlayerRef = useRef<HlsPlayerRef>({
    video: null,
    hls: null,
  });

  useEffect(() => {
    let hls: Hls;

    // Initialize HLS when the component mounts
    const initHls = () => {
      if (videoRef.current) {
        if (Hls.isSupported()) {
          // Create HLS instance
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            ...hlsConfig,
          });

          // Store HLS reference
          hlsRef.current = hls;

          // Update playerRef
          if (playerRef) {
            playerRef.current = {
              video: videoRef.current,
              hls: hls,
            };
          } else {
            internalPlayerRef.current = {
              video: videoRef.current,
              hls: hls,
            };
          }

          // Register HLS event handlers
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            onHlsMediaAttached?.();
          });

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (autoPlay) {
              videoRef.current?.play().catch((error) => {
                console.error("Autoplay failed:", error);
              });
            }
            onHlsManifestParsed?.(data);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  // Try to recover network error
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  // Try to recover media error
                  hls.recoverMediaError();
                  break;
                default:
                  // Unrecoverable error
                  destroyHls();
                  break;
              }
            }
            onHlsError?.(event, data);
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            onHlsLevelSwitched?.(data.level);
          });

          // Attach media
          hls.attachMedia(videoRef.current);

          // Load stream
          hls.loadSource(src);

          // Call initialization callback
          onHlsInit?.(hls);

          // Call ready callback
          onHlsReady?.(hls, videoRef.current);
        } else if (
          videoRef.current.canPlayType("application/vnd.apple.mpegurl")
        ) {
          // Native HLS support (iOS Safari)
          videoRef.current.src = src;
        } else {
          console.error("HLS is not supported in this browser");
        }
      }
    };

    // Clean up HLS instance
    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    // Initialize
    initHls();

    // Cleanup function
    return () => {
      destroyHls();

      // Clean up references
      if (playerRef) {
        playerRef.current = {
          video: null,
          hls: null,
        };
      } else {
        internalPlayerRef.current = {
          video: null,
          hls: null,
        };
      }
    };
  }, [
    src,
    autoPlay,
    hlsConfig,
    onHlsInit,
    onHlsReady,
    onHlsError,
    onHlsMediaAttached,
    onHlsManifestParsed,
    onHlsLevelSwitched,
    playerRef,
  ]);

  // Detect video ref changes with useEffect
  useEffect(() => {
    if (videoRef.current) {
      // Update video reference
      if (playerRef) {
        playerRef.current = {
          ...playerRef.current,
          video: videoRef.current,
        };
      } else {
        internalPlayerRef.current = {
          ...internalPlayerRef.current,
          video: videoRef.current,
        };
      }
    }
  }, [videoRef.current, playerRef]);

  return <video ref={videoRef} controls={true} {...props} />;
};

export default HlsPlayer;
