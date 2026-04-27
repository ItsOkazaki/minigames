"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

export function useHandTracking(options: { maxNumHands?: number } = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resultsRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const onResults = useCallback((handResults: any) => {
    resultsRef.current = handResults;
  }, []);

  const initHandTracking = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if (!window.Hands || !window.Camera) {
      console.log("Waiting for MediaPipe scripts to be available on window...");
      setTimeout(initHandTracking, 500);
      return;
    }

    if (handsRef.current) return;

    try {
      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: options.maxNumHands || 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        selfieMode: false // We'll handle mirroring manually to be consistent with the original code
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });
        await camera.start();
        cameraRef.current = camera;
        setIsLoaded(true);
        setIsCameraActive(true);
        console.log("Hand tracking initialized and camera started.");
      }
    } catch (err) {
      console.error("Failed to init hand tracking:", err);
    }
  }, [onResults, options.maxNumHands]);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  return { videoRef, resultsRef, isLoaded, isCameraActive, initHandTracking };
}
