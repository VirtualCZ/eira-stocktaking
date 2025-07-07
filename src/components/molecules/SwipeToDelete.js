import React, { useState, useRef } from 'react';

export default function SwipeToDelete({ onConfirm }) {
    const [sliderPosition, setSliderPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef(null);
    const containerRef = useRef(null);

    const handleDragStart = (e) => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const containerWidth = containerRef.current.offsetWidth;
        const sliderWidth = sliderRef.current.offsetWidth;

        if (sliderPosition > containerWidth - sliderWidth - 5) {
            onConfirm();
        }
        // Snap back
        setSliderPosition(0);
    };

    const handleDrag = (e) => {
        if (!isDragging || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const sliderWidth = sliderRef.current.offsetWidth;
        let newX = (e.clientX || e.touches[0].clientX) - containerRect.left - (sliderWidth / 2);

        // Clamp the position
        if (newX < 0) newX = 0;
        if (newX > containerRect.width - sliderWidth) newX = containerRect.width - sliderWidth;

        setSliderPosition(newX);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDrag}
            onTouchEnd={handleDragEnd}
            style={{
                width: '100%',
                height: 48,
                borderRadius: 24,
                background: 'rgba(255, 63, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
            }}
        >
            <span style={{ color: '#FF3F44', fontWeight: 600, fontSize: 12 }}>
                Pro smazání přejeďte doprava
            </span>
            <div
                ref={sliderRef}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                style={{
                    position: 'absolute',
                    left: `${sliderPosition}px`,
                    top: 0,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: '#FF3F44',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab'
                }}
            >
                <span className="material-icons-round" style={{ fontSize: 24, color: '#fff' }}>
                    keyboard_double_arrow_right
                </span>
            </div>
        </div>
    );
} 