// Kine Logo Component - Gesture-inspired flowing design (static)
const KineLogo = ({ size = 48, showText = false, textColor = "#1d1d1f" }) => {
    return (
        <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    flexShrink: 0
                }}
            >
                {/* Rounded square background - always black */}
                <rect
                    width="48"
                    height="48"
                    rx="12"
                    fill="#000000"
                />

                {/* Abstract gesture path - flowing K-like shape */}
                <path
                    d="M 18 14 Q 20 14 20 16 L 20 32 Q 20 34 18 34 Q 16 34 16 32 L 16 16 Q 16 14 18 14 Z M 28 20 L 34 14 Q 36 12 38 14 Q 40 16 38 18 L 30 26 L 38 34 Q 40 36 38 38 Q 36 40 34 38 L 26 30 Q 24 28 26 26 L 32 20 Q 34 18 32 20 L 28 24"
                    fill="white"
                    fillOpacity="0.95"
                />
            </svg>

            {showText && (
                <span
                    style={{
                        fontFamily: 'Outfit, Inter, sans-serif',
                        fontSize: size * 0.5,
                        fontWeight: 600,
                        color: textColor,
                        letterSpacing: '-0.02em'
                    }}
                >
                    Kine
                </span>
            )}
        </div>
    );
};

export default KineLogo;
