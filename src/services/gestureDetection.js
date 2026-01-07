import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

/**
 * Gesture Detection Service
 * Initializes MediaPipe Hands and processes video frames to detect hand landmarks
 */
class GestureDetectionService {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.onResults = null;
        this.isInitialized = false;
    }

    /**
     * Initialize MediaPipe Hands
     * @param {HTMLVideoElement} videoElement - The video element to process
     * @param {Function} onResultsCallback - Callback function to receive hand landmarks
     */
    async initialize(videoElement, onResultsCallback) {
        console.log('Initializing MediaPipe Hands...');

        this.onResults = onResultsCallback;

        // Configure MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1, // Detect only one hand for simplicity
            modelComplexity: 1, // 0 (lite), 1 (full), 2 (heavy)
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        // Set the results callback
        this.hands.onResults(this.handleResults.bind(this));

        // Initialize camera
        if (videoElement) {
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (this.hands) {
                        await this.hands.send({ image: videoElement });
                    }
                },
                width: 640,
                height: 480
            });
        }

        this.isInitialized = true;
        console.log('MediaPipe Hands initialized successfully');
    }

    /**
     * Start processing video frames
     */
    async start() {
        if (!this.isInitialized) {
            console.error('Gesture detection not initialized');
            return false;
        }

        if (this.camera) {
            await this.camera.start();
            console.log('Camera processing started');
            return true;
        }

        return false;
    }

    /**
     * Stop processing video frames
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
            console.log('Camera processing stopped');
        }
    }

    /**
     * Handle results from MediaPipe Hands
     * @param {Object} results - Results from MediaPipe containing hand landmarks
     */
    handleResults(results) {
        if (this.onResults) {
            this.onResults(results);
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stop();
        if (this.hands) {
            this.hands.close();
            this.hands = null;
        }
        this.camera = null;
        this.isInitialized = false;
        console.log('Gesture detection cleaned up');
    }
}

export default GestureDetectionService;
