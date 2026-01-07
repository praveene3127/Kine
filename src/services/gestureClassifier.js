/**
 * Gesture Classifier
 * Maps hand landmarks to recognized gestures (letters, commands)
 */

/**
 * Basic gesture patterns
 * Each pattern defines key characteristics of hand landmarks for a gesture
 * For MVP, we'll use simplified pattern matching
 */
const GESTURE_PATTERNS = {
    // Fist (Delete)
    DELETE: {
        name: 'delete',
        description: 'Closed fist',
        check: (landmarks) => {
            if (!landmarks || landmarks.length === 0) return false;
            // Check if all fingers are curled (fingertips close to palm)
            const fingertips = [4, 8, 12, 16, 20]; // Thumb, index, middle, ring, pinky tips
            const palm = landmarks[0]; // Wrist/palm base

            let curledCount = 0;
            fingertips.forEach(tipIndex => {
                const tip = landmarks[tipIndex];
                const distance = Math.sqrt(
                    Math.pow(tip.x - palm.x, 2) +
                    Math.pow(tip.y - palm.y, 2)
                );
                if (distance < 0.15) curledCount++; // Threshold for "curled"
            });

            return curledCount >= 4; // At least 4 fingers curled
        }
    },

    // Open palm (Space)
    SPACE: {
        name: 'space',
        description: 'Open palm, all fingers extended',
        check: (landmarks) => {
            if (!landmarks || landmarks.length === 0) return false;
            // Check if all fingers are extended
            const fingertips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
            const fingerBases = [5, 9, 13, 17]; // Corresponding finger bases

            let extendedCount = 0;
            fingertips.forEach((tipIndex, i) => {
                const tip = landmarks[tipIndex];
                const base = landmarks[fingerBases[i]];
                // Finger is extended if tip is significantly above base
                if (tip.y < base.y - 0.05) extendedCount++;
            });

            return extendedCount >= 3; // At least 3 fingers extended
        }
    },

    // Index finger pointing (Letter A for MVP)
    LETTER_A: {
        name: 'A',
        description: 'Index finger pointing up, other fingers curled',
        check: (landmarks) => {
            if (!landmarks || landmarks.length === 0) return false;
            const indexTip = landmarks[8];
            const indexBase = landmarks[5];
            const middleTip = landmarks[12];
            const palm = landmarks[0];

            // Index extended
            const indexExtended = indexTip.y < indexBase.y - 0.08;
            // Middle curled
            const middleCurled = Math.abs(middleTip.y - palm.y) < 0.12;

            return indexExtended && middleCurled;
        }
    },

    // Peace sign (Letter B for MVP)
    LETTER_B: {
        name: 'B',
        description: 'Index and middle fingers extended, others curled',
        check: (landmarks) => {
            if (!landmarks || landmarks.length === 0) return false;
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const indexBase = landmarks[5];
            const middleBase = landmarks[9];
            const palm = landmarks[0];

            // Index and middle extended
            const indexExtended = indexTip.y < indexBase.y - 0.08;
            const middleExtended = middleTip.y < middleBase.y - 0.08;
            // Ring curled
            const ringCurled = Math.abs(ringTip.y - palm.y) < 0.12;

            return indexExtended && middleExtended && ringCurled;
        }
    },

    // OK sign (Letter C for MVP)
    LETTER_C: {
        name: 'C',
        description: 'Thumb and index forming circle',
        check: (landmarks) => {
            if (!landmarks || landmarks.length === 0) return false;
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];

            // Distance between thumb and index fingertips
            const distance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) +
                Math.pow(thumbTip.y - indexTip.y, 2)
            );

            // Close together = forming circle
            return distance < 0.05;
        }
    }
};

/**
 * Classify a gesture based on hand landmarks
 * @param {Array} landmarks - Array of hand landmark objects with x, y, z coordinates
 * @returns {Object} { gesture: string, confidence: number }
 */
export function classifyGesture(landmarks) {
    if (!landmarks || landmarks.length !== 21) {
        return { gesture: null, confidence: 0 };
    }

    // Check each gesture pattern
    const results = [];

    for (const [key, pattern] of Object.entries(GESTURE_PATTERNS)) {
        if (pattern.check(landmarks)) {
            // Simple confidence based on how many checks passed
            // In production, this would use ML model confidence scores
            results.push({
                gesture: pattern.name,
                confidence: 0.85 + Math.random() * 0.15 // Simulated 85-100% confidence
            });
        }
    }

    // Return highest confidence gesture
    if (results.length > 0) {
        return results.sort((a, b) => b.confidence - a.confidence)[0];
    }

    return { gesture: null, confidence: 0 };
}

/**
 * Get all available gestures
 * @returns {Array} List of gesture names and descriptions
 */
export function getAvailableGestures() {
    return Object.values(GESTURE_PATTERNS).map(p => ({
        name: p.name,
        description: p.description
    }));
}

export default {
    classifyGesture,
    getAvailableGestures
};
