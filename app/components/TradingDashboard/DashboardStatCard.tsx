"use client";

import React, { useCallback, useEffect, useRef } from "react";
import styles from "./DashboardStatCard.module.css";

export type DashboardStatCardProps = {
  title: string;
  value: string;
};

export default function DashboardStatCard({ title, value }: DashboardStatCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sparkleIntervalRef = useRef<number | null>(null);

  const resetEffects = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--mouse-x", "50%");
    el.style.setProperty("--mouse-y", "100%");
    el.style.setProperty("--glow-intensity", "0.8");
    el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)";
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    el.style.setProperty("--mouse-x", `${xPercent}%`);
    el.style.setProperty("--mouse-y", `${yPercent}%`);
    el.style.setProperty("--mouse-x-px", `${x}px`);
    el.style.setProperty("--mouse-y-px", `${y}px`);

    const intensity = 0.6 + (yPercent / 100) * 0.4;
    el.style.setProperty("--glow-intensity", String(intensity));

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleX = (e.clientY - centerY) / 40;
      const angleY = (e.clientX - centerX) / -40;
      el.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
    });
  };

  const handleMouseLeave = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    resetEffects();
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function createSparkle() {
      const host = cardRef.current;
      if (!host) return;
      const sparkle = document.createElement("div");
      sparkle.className = styles.sparkle;
      sparkle.style.left = Math.random() * 100 + "%";
      sparkle.style.top = Math.random() * 100 + "%";
      host.appendChild(sparkle);
      window.setTimeout(() => sparkle.remove(), 1500);
    }

    sparkleIntervalRef.current = window.setInterval(() => {
      if (Math.random() > 0.7) createSparkle();
    }, 2000) as unknown as number;

    return () => {
      if (sparkleIntervalRef.current) window.clearInterval(sparkleIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-center font-sans">
      <div
        ref={cardRef}
        className={`${styles.glowCard} ${styles.xs}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.cardBg} />
        <div className={styles.glowBorder} />
        <div className={styles.innerGlow} />
        <div className={styles.topGlow} />
        <div className={styles.bottomGlow} />
        <div className={styles.innerLight} />
        <div className={`${styles.cornerHighlight} ${styles.topLeft}`} />
        <div className={`${styles.cornerHighlight} ${styles.bottomRight}`} />
        <div className={styles.shine} />
        <div className={styles.mouseGlow} />

        <div className={styles.cardContent}>
          <div className={styles.textSmall}>{title}</div>
          <div className={styles.textLarge}>{value}</div>
        </div>
      </div>
    </div>
  );
}


