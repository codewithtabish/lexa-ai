"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContactCta() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "bg-linear-to-br from-primary via-primary to-primary/80",
            "px-5 py-10 text-center sm:px-10 sm:py-14 lg:py-16",
            "shadow-2xl shadow-primary/30",
          )}
        >
          {/* Decorative floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 size-64 rounded-full bg-primary-foreground/20 blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-primary-foreground/15 blur-[80px]" />
            <div className="absolute left-1/4 top-1/3 size-3 rounded-full bg-primary-foreground/40 blur-sm" />
            <div className="absolute right-1/3 top-2/3 size-4 rounded-full bg-primary-foreground/30 blur-sm" />
            <div className="absolute left-1/2 top-10 size-2 rounded-full bg-primary-foreground/50 blur-sm" />
          </div>

          <div className="relative flex flex-col items-center gap-5">
            {/* Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "bg-primary-foreground/20 backdrop-blur-sm",
                "px-3.5 py-1.5",
                "text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground",
              )}
            >
              Let&apos;s Talk
            </span>

            {/* Headline */}
            <h2 className="max-w-2xl text-2xl font-extrabold leading-[1.15] tracking-[-0.028em] text-primary-foreground sm:text-3xl lg:text-[2.5rem]">
              Have a question or idea?
            </h2>

            {/* Subheadline */}
            <p className="max-w-xl text-sm leading-relaxed text-primary-foreground/90 sm:text-base lg:text-[17px]">
              Whether you want to partner, build, or just say hi — we&apos;d love
              to hear from you.
            </p>

            {/* CTAs */}
            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              {/* Contact Us → /contact */}
              <Button
                asChild
                size="lg"
                className={cn(
                  "group/btn h-11 rounded-full px-6 text-sm font-semibold sm:text-base",
                  "bg-primary-foreground text-primary",
                  "shadow-lg shadow-black/10",
                  "transition-all duration-300",
                  "hover:bg-primary-foreground/95 hover:shadow-xl",
                )}
              >
                <Link href="/contact">
                  Contact Us
                  <ArrowRight
                    className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
              </Button>

              {/* Visit CodeWithTabish → external */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  "group/btn h-11 rounded-full px-6 text-sm font-semibold sm:text-base",
                  "border-primary-foreground/40 bg-primary-foreground/5 text-primary-foreground backdrop-blur-sm",
                  "transition-all duration-300",
                  "hover:border-primary-foreground/70 hover:bg-primary-foreground/15",
                )}
              >
                <a
                  href="http://codewithtabish.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit codewithtabish.com
                  <ExternalLink
                    className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </a>
              </Button>
            </div>

            {/* Footer text */}
            <p className="mt-1 text-[11px] text-primary-foreground/70 sm:text-xs">
              Reply within 24 hours · hello@lexa.ai
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}