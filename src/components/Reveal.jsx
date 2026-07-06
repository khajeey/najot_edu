import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

// Scrollda ko'rinadigan fade animatsiyasi. Element viewportga kirganda
// sekin paydo bo'ladi (fade + siljish). direction: "up" | "down" | "left" | "right".
const OFFSETS = {
  up: "translateY(28px)",
  down: "translateY(-28px)",
  left: "translateX(28px)",
  right: "translateX(-28px)",
};

export default function Reveal({
  children,
  component = "div",
  direction = "up",
  index = 0,
  sx,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component={component}
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : OFFSETS[direction] || OFFSETS.up,
        transition:
          "opacity 520ms ease, transform 560ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${Math.min(index, 12) * 45}ms`,
        willChange: "opacity, transform",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
