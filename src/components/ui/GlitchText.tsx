import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type GlitchTextProps<T extends ElementType = "span"> = {
  as?: T;
  text: string;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function GlitchText<T extends ElementType = "span">({
  as,
  text,
  className,
  children,
  ...rest
}: GlitchTextProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={className} data-glitch={text} {...rest}>
      {children ?? text}
    </Tag>
  );
}
