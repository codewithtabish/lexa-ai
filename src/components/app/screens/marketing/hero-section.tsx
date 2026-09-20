// src/components/app/screens/landing/hero-section.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Shield,
  Zap,
  Lock,
  Sparkles,
  Upload,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  const { isSignedIn } = useUser();

  const steps = [
    {
      number: "1",
      icon: Upload,
      title: "Upload Your Photo",
      description: "Choose a clear selfie or portrait from your gallery.",
    },
    {
      number: "2",
      icon: Wand2,
      title: "Pick a Transformation",
      description: "Select from hairstyles, beards, outfits, age and more.",
    },
    {
      number: "3",
      icon: Sparkles,
      title: "Get Your New Look",
      description: "AI works its magic and delivers stunning results in seconds.",
    },
  ];

  return (
    <section className="relative w-full">
      {/* ========== TOP HERO ========== */}
      <div className="pt-32 pb-12 sm:pt-36 sm:pb-14 lg:pt-40 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start text-left space-y-5 sm:space-y-6 w-full max-w-xl"
          >
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-medium tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI BEAUTY ENGINE · v2.0
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold tracking-tight leading-[1.12] text-foreground">
              Transform Your{" "}
              <span className="text-primary">Look with AI</span>{" "}
              in Seconds
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Try new hairstyles, beard styles, outfits, and age transformations
              in seconds. Get{" "}
              <span className="font-semibold text-foreground">
                4 free credits
              </span>{" "}
              on signup — no credit card required.
            </p>

            {/* BUTTONS */}
            {/* Mobile: Only "Get Started Free" shows, auto-width */}
            {/* Tablet+: Both buttons show side-by-side */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full sm:w-auto">
              {isSignedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-auto px-7 text-base font-semibold rounded-full self-start"
                >
                  <Link href="/dashboard">
                    Open App
                    <span className="ml-2">→</span>
                  </Link>
                </Button>
              ) : (
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="h-12 w-auto px-7 text-base font-semibold rounded-full self-start"
                  >
                    Get Started Free
                    <span className="ml-2">→</span>
                  </Button>
                </SignUpButton>
              )}

              {/* 🆕 Hidden on mobile, visible on tablet+ */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 hidden sm:inline-flex px-7 text-base font-medium rounded-full"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.9/5</span>
                <span>· 12k+ users</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Secure</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Instant Results</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - HERO IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15,
            }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full max-w-[500px] aspect-square"
            >
              <Image
                src="/images/hero_one.png"
                alt="AI Beauty Transformation - Try new hairstyles, outfits & more"
                fill
                priority
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-12 lg:mt-14 grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            {
              icon: Sparkles,
              label: "Multiple Transformations",
              desc: "Hairstyles, beards, outfits & more",
            },
            {
              icon: Zap,
              label: "Powered by Advanced AI",
              desc: "Realistic, natural & high-quality results",
            },
            {
              icon: Zap,
              label: "Lightning Fast",
              desc: "See your new look in seconds",
            },
            {
              icon: Shield,
              label: "Secure & Private",
              desc: "Your photos are always safe with us",
            },
            {
              icon: Sparkles,
              label: "Express Yourself",
              desc: "Explore, create, be you — no limits",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center text-center p-3.5 sm:p-4 rounded-xl",
                "bg-muted/30 dark:bg-muted/15 border border-border/40",
                "hover:bg-muted/50 dark:hover:bg-muted/25 transition-colors duration-200"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground leading-tight">
                {item.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ========== HOW IT WORKS ========== */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="relative w-full bg-foreground/15 rounded-3xl overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="space-y-5"
              >
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 text-xs font-medium tracking-wide"
                >
                  HOW IT WORKS
                </Badge>

                <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight text-foreground">
                  Get Your New Look{" "}
                  <span className="text-primary">in 3 Simple Steps</span>
                </h2>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                  From a single photo to a whole new you — it only takes seconds.
                  It&apos;s that easy.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-8 sm:gap-4"
              >
                {steps.map((step, i) => (
                  <div
                    key={step.number}
                    className="flex items-start sm:items-center gap-4 sm:gap-0 sm:flex-col sm:text-center flex-1 relative"
                  >
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-0 w-full">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
                          <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm">
                          {step.number}
                        </span>
                      </div>

                      <div className="sm:mt-4">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[180px] sm:mx-auto">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {i < steps.length - 1 && (
                      <div className="hidden sm:flex absolute top-8 -right-3 lg:-right-4 items-center justify-center text-primary/50">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}