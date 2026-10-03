import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardSize = "sm" | "md" | "lg";

interface CardProps {
  size?: CardSize;
  className?: string;
  children: ReactNode;
}

export function Card({ size = "md", className, children }: CardProps) {
  const classes = [styles.card, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
