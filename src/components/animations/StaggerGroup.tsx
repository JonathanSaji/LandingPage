"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface StaggerGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  itemClassName?: string;
  as?: "div" | "ul" | "section";
  variants?: Variants;
  itemVariants?: Variants;
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0.15,
  itemClassName,
  as = "div",
  variants,
  itemVariants = staggerItem,
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotion();
  const containerVariants = variants ?? staggerContainer(stagger, delayChildren);
  const Component = as === "ul" ? motion.ul : as === "section" ? motion.section : motion.div;

  if (reduceMotion) {
    const Tag = as === "ul" ? "ul" : as === "section" ? "section" : "div";
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants} className={itemClassName}>
              {child}
            </motion.div>
          ))
        : children}
    </Component>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  );
}
