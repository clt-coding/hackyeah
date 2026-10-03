import type { ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerSize = "sm" | "md" | "lg" | "full";

interface ContainerProps {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
}

export function Container({ size = "md", className, children }: ContainerProps) {
  const classes = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
