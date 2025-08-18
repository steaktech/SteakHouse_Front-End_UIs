'use client';

import React, { FC, useEffect, useRef } from 'react';
import styles from './ComingSoonPage.module.css';

/**
 * Background effects component with canvas and animated elements
 */
const EffectsCanvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Simple particle animation (optional enhancement)
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            alpha: number;
        }> = [];

        // Create particles
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.3 + 0.1
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw particles
            particles.forEach(particle => {
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = '#ff6b35';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                ctx.fill();

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className={styles.fxCanvas}
                aria-hidden="true"
            />
            <div className={styles.grain} aria-hidden="true"></div>
            <div className={styles.heatBase} aria-hidden="true"></div>
        </>
    );
};

export default EffectsCanvas;
