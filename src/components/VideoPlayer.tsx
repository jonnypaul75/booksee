import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

/**
 * Reusable HTML5 video player with HLS support.
 *
 * Source handling:
 *   - .mp4 / .m4a / .webm  → set as `video.src` directly
 *   - .m3u8 on Safari      → set as `video.src` (native HLS)
 *   - .m3u8 elsewhere      → dynamically imports hls.js and attaches
 *
 * The hls.js import is lazy so the library is only fetched when an HLS
 * stream is actually played (keeps the initial bundle small).
 *
 * Imperative API via ref:
 *   const ref = useRef<VideoPlayerHandle>(null);
 *   ref.current?.play(); ref.current?.seek(120);
 */

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  /** Direct access to the underlying <video> element (advanced). */
  videoElement: HTMLVideoElement | null;
}

export interface VideoPlayerProps {
  src: string | undefined | null;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  className?: string;
  style?: React.CSSProperties;
  /** Show native browser controls (default false; we render our own in players). */
  controls?: boolean;
  /** Tag the video element with an aria-label. */
  ariaLabel?: string;

  // Event callbacks
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (message: string) => void;
  onWaiting?: () => void;
  onPlaying?: () => void;
  onBuffered?: (bufferedEnd: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(props, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    // Hold the hls.js instance so we can destroy it on src change / unmount.
    const hlsRef = useRef<unknown>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        play: () => videoRef.current?.play() ?? Promise.resolve(),
        pause: () => videoRef.current?.pause(),
        seek: (seconds: number) => {
          const v = videoRef.current;
          if (!v || !Number.isFinite(seconds)) return;
          try {
            v.currentTime = Math.max(0, seconds);
          } catch {
            /* seek before metadata loaded — ignore */
          }
        },
        getCurrentTime: () => videoRef.current?.currentTime ?? 0,
        getDuration: () => videoRef.current?.duration ?? 0,
        videoElement: videoRef.current,
      }),
      []
    );

    // ----- Source / HLS setup -----
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !props.src) return;

      setError(null);
      let cancelled = false;
      const isHls = /\.m3u8(\?|$)/i.test(props.src);

      const cleanupHls = () => {
        const inst = hlsRef.current as { destroy?: () => void } | null;
        try {
          inst?.destroy?.();
        } catch {
          /* ignore */
        }
        hlsRef.current = null;
      };

      const setup = async () => {
        cleanupHls();

        // Native HLS path (Safari, iOS)
        if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = props.src!;
          return;
        }

        if (isHls) {
          try {
            // Dynamic import so hls.js only loads when an HLS URL is actually played.
            const HlsMod = await import('hls.js');
            if (cancelled) return;
            const Hls = HlsMod.default;
            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 60,
              });
              hlsRef.current = hls;
              hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean; type: string; details: string }) => {
                if (data.fatal) {
                  const msg = `HLS error: ${data.type} / ${data.details}`;
                  setError(msg);
                  props.onError?.(msg);
                }
              });
              hls.loadSource(props.src!);
              hls.attachMedia(video);
            } else {
              // hls.js not supported AND no native HLS — last-ditch attempt
              video.src = props.src!;
            }
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to load HLS player';
            setError(msg);
            props.onError?.(msg);
          }
          return;
        }

        // Plain video file (.mp4 / .m4a / .webm)
        video.src = props.src!;
      };

      setup();

      return () => {
        cancelled = true;
        cleanupHls();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.src]);

    return (
      <div className="bs-videoplayer" style={{ position: 'relative', width: '100%', height: '100%', ...props.style }}>
        <video
          ref={videoRef}
          poster={props.poster}
          autoPlay={props.autoPlay}
          muted={props.muted}
          loop={props.loop}
          playsInline={props.playsInline ?? true}
          preload={props.preload ?? 'metadata'}
          controls={props.controls}
          aria-label={props.ariaLabel}
          className={props.className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            background: '#000',
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            props.onTimeUpdate?.(v.currentTime, isFinite(v.duration) ? v.duration : 0);
            if (v.buffered.length > 0) {
              props.onBuffered?.(v.buffered.end(v.buffered.length - 1));
            }
          }}
          onPlay={() => props.onPlay?.()}
          onPause={() => props.onPause?.()}
          onEnded={() => props.onEnded?.()}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            props.onLoadedMetadata?.(isFinite(v.duration) ? v.duration : 0);
          }}
          onError={(e) => {
            const v = e.currentTarget;
            const codeMap: Record<number, string> = {
              1: 'Aborted',
              2: 'Network error',
              3: 'Decode error',
              4: 'Source not supported',
            };
            const code = v.error?.code ?? 0;
            const msg = v.error?.message || codeMap[code] || `Video error (${code})`;
            setError(msg);
            props.onError?.(msg);
          }}
          onWaiting={() => props.onWaiting?.()}
          onPlaying={() => props.onPlaying?.()}
        />

        {/* Poster fallback when the source errors — keeps the player looking intact. */}
        {error && props.poster && (
          <img
            src={props.poster}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
          />
        )}
        {error && (
          <div className="bs-video-error" role="alert">
            <span>Preview unavailable</span>
            <small>{error}</small>
          </div>
        )}
      </div>
    );
  }
);

export default VideoPlayer;
