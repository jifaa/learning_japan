"use client"

import { type Variants, motion } from "motion/react"
import { useReducedMotion } from "@/lib/use-reduced-motion"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  once?: boolean
}

const directionVariants: Record<string, { initial: Record<string, number>; animate: Record<string, number> }> = {
  up: { initial: { y: 16, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  down: { initial: { y: -16, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  left: { initial: { x: 16, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  right: { initial: { x: -16, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  none: { initial: { opacity: 0 }, animate: { opacity: 1 } },
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  direction = "up",
  once = true,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const variant = directionVariants[direction]
  const motionVariants: Variants = {
    initial: variant.initial,
    animate: variant.animate,
  }

  return (
    <motion.div
      className={className}
      variants={motionVariants}
      initial="initial"
      animate="animate"
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  )
}
