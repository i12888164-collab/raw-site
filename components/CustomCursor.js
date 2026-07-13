"use client";
import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    let raf;

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
    }

    function loop() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      raf = requestAnimationFrame(loop);
    }

    function onEnter(e) {
      if (e.target.closest("a, button, input, select, textarea, [data-cursor-hover]")) {
        ringRef.current?.classList.add("cursor-hover");
      }
    }
    function onLeave(e) {
      if (e.target.closest("a, button, input, select, textarea, [data-cursor-hover]")) {
        ringRef.current?.classList.remove("cursor-hover");
      }
    }

    document.body.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      document.body.classList.remove("has-custom-cursor");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
