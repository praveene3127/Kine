import { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import GestureDetectionService from '../services/gestureDetection';
import { classifyGesture } from '../services/gestureClassifier';

const GestureContext = createContext(null);

export const useGesture = () => {
    const context = useContext(GestureContext);
    if (!context) {
        throw new Error('useGesture must be used within a GestureProvider');
    }
    return context;
};

export const GestureProvider = ({ children }) => {
    const [cameraStatus, setCameraStatus] = useState('not_granted');
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [calibrationData, setCalibrationData] = useState(null);
    const [lastGesture, setLastGesture] = useState(null);
    const [confidenceLevel, setConfidenceLevel] = useState(0);
    const [inputMode, setInputMode] = useState('gesture_typing');
    const [sensitivity, setSensitivity] = useState('medium');
    const [handLandmarks, setHandLandmarks] = useState(null); // Current hand landmarks
    const [isGestureDetectionActive, setIsGestureDetectionActive] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const gestureServiceRef = useRef(null);
    const lastGestureTimeRef = useRef(0);
    const gestureCallbackRef = useRef(null); // Callback for gesture events

    // Request camera permission without starting the stream
    const requestCameraPermission = useCallback(async () => {
        console.log('=== REQUEST CAMERA PERMISSION ===');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());

            setCameraStatus('granted');
            console.log('Camera permission granted');
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            setCameraStatus('denied');
            return false;
        }
    }, []);

    // Handle results from MediaPipe
    const handleMediaPipeResults = useCallback((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]; // Use first hand
            setHandLandmarks(landmarks);

            // Classify gesture
            const { gesture, confidence } = classifyGesture(landmarks);

            if (gesture && confidence > 0.75) { // Confidence threshold
                const now = Date.now();
                // Debounce gestures (minimum 500ms between detections)
                if (now - lastGestureTimeRef.current > 500) {
                    lastGestureTimeRef.current = now;
                    setLastGesture(gesture);
                    setConfidenceLevel(confidence);

                    // Trigger callback if registered
                    if (gestureCallbackRef.current) {
                        gestureCallbackRef.current({
                            gesture,
                            confidence,
                            timestamp: now
                        });
                    }
                }
            }
        } else {
            setHandLandmarks(null);
        }
    }, []);

    // Start camera with gesture detection
    const startCamera = useCallback(async (videoElement) => {
        console.log('=== START CAMERA WITH GESTURE DETECTION ===');

        if (cameraStatus === 'active' && streamRef.current) {
            console.log('Camera already active');
            return true;
        }

        try {
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            console.log('Got stream, connecting to video element...');
            streamRef.current = stream;
            videoRef.current = videoElement;

            if (videoElement) {
                videoElement.srcObject = stream;

                // Wait for video to be ready
                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = () => {
                        resolve();
                    };
                });

                // Initialize MediaPipe gesture detection
                console.log('Initializing gesture detection...');
                gestureServiceRef.current = new GestureDetectionService();
                await gestureServiceRef.current.initialize(videoElement, handleMediaPipeResults);
                await gestureServiceRef.current.start();
                setIsGestureDetectionActive(true);
                console.log('Gesture detection started');
            }

            setCameraStatus('active');
            console.log('Camera is now active');
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            setCameraStatus('denied');
            return false;
        }
    }, [cameraStatus, handleMediaPipeResults]);

    // Stop camera and gesture detection
    const stopCamera = useCallback(() => {
        console.log('=== STOP CAMERA AND GESTURE DETECTION ===');

        // Stop gesture detection
        if (gestureServiceRef.current) {
            gestureServiceRef.current.cleanup();
            gestureServiceRef.current = null;
            setIsGestureDetectionActive(false);
        }

        // Stop camera stream
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            console.log('Stopping', tracks.length, 'tracks...');

            tracks.forEach(track => {
                console.log('Stopping track:', track.kind, 'readyState:', track.readyState);
                track.stop();
                console.log('After stop, readyState:', track.readyState);
            });

            streamRef.current = null;
        }

        // Clear video element
        if (videoRef.current) {
            console.log('Clearing video srcObject');
            videoRef.current.srcObject = null;
        }

        setHandLandmarks(null);
        setCameraStatus('granted');
        console.log('Camera stopped, status set to granted');
    }, []);

    // Register callback for gesture events
    const onGestureDetected = useCallback((callback) => {
        gestureCallbackRef.current = callback;
    }, []);

    // Simulated gesture recognition for demo purposes (keeping for backward compatibility)
    const simulateGesture = useCallback((gestureName) => {
        const confidence = 0.85 + Math.random() * 0.15;
        setLastGesture(gestureName);
        setConfidenceLevel(confidence);
        return { gesture: gestureName, confidence };
    }, []);

    const saveCalibration = useCallback((data) => {
        setCalibrationData(data);
        setIsCalibrated(true);
        localStorage.setItem('kine_calibration', JSON.stringify(data));
    }, []);

    const loadCalibration = useCallback(() => {
        const saved = localStorage.getItem('kine_calibration');
        if (saved) {
            setCalibrationData(JSON.parse(saved));
            setIsCalibrated(true);
            return JSON.parse(saved);
        }
        return null;
    }, []);

    const updateSensitivity = useCallback((level) => {
        setSensitivity(level);
        localStorage.setItem('kine_sensitivity', level);
    }, []);

    // Load saved settings on mount
    useEffect(() => {
        loadCalibration();
        const savedSensitivity = localStorage.getItem('kine_sensitivity');
        if (savedSensitivity) {
            setSensitivity(savedSensitivity);
        }
    }, [loadCalibration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (gestureServiceRef.current) {
                gestureServiceRef.current.cleanup();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const value = {
        cameraStatus,
        isCalibrated,
        calibrationData,
        lastGesture,
        confidenceLevel,
        inputMode,
        sensitivity,
        handLandmarks,
        isGestureDetectionActive,
        setInputMode,
        requestCameraPermission,
        startCamera,
        stopCamera,
        onGestureDetected,
        simulateGesture,
        saveCalibration,
        loadCalibration,
        updateSensitivity,
    };

    return (
        <GestureContext.Provider value={value}>
            {children}
        </GestureContext.Provider>
    );
};

export default GestureContext;
