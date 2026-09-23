"use client";

import { beardTest } from "@/actions/test/beard-test";
import { useState } from "react";

// ============================================================
// TEST IMAGES
// Paste your two public image URLs here.
// ============================================================

const USER_IMAGE_URL =
  "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/two.png";

const BEARD_REFERENCE_URL =
  "https://d2rpzp0h8kdnc1.cloudfront.net/lexa/Full_Beard_Mustache_With_Skin.png";

export default function BeardTest() {
  const [resultImageUrl, setResultImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  // ============================================================
  // TEST BEARD
  // ============================================================

  async function handleBeardTest() {
    setError("");
    setResultImageUrl("");
    setCopied(false);

    try {
      setLoading(true);

      console.log(
        "🧔 Starting LEXA Beard Test..."
      );

      const result = await beardTest({
        userImageUrl: USER_IMAGE_URL,
        beardReferenceUrl: BEARD_REFERENCE_URL,
      });

      if (!result.success) {
        throw new Error(
          result.error ||
            "Beard generation failed."
        );
      }

      if (!result.resultImageUrl) {
        throw new Error(
          "No result image URL was returned."
        );
      }

      console.log(
        "✅ Result Image URL:",
        result.resultImageUrl
      );

      setResultImageUrl(
        result.resultImageUrl
      );
    } catch (err) {
      console.error(
        "❌ Beard test failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // COPY RESULT URL
  // ============================================================

  async function handleCopyUrl() {
    if (!resultImageUrl) return;

    try {
      await navigator.clipboard.writeText(
        resultImageUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Could not copy the image URL."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-4xl">

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            🧔 LEXA AI · Beard Studio
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Beard Test
          </h1>

          <p className="mt-3 text-white/50">
            Test the Hive beard transformation
            pipeline.
          </p>
        </div>

        {/* ====================================================== */}
        {/* TEST CARD */}
        {/* ====================================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">

          {/* IMAGE INFORMATION */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                User Image
              </p>

              <p className="break-all text-xs text-white/50">
                {USER_IMAGE_URL}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                Beard Reference
              </p>

              <p className="break-all text-xs text-white/50">
                {BEARD_REFERENCE_URL}
              </p>
            </div>

          </div>

          {/* ==================================================== */}
          {/* ERROR */}
          {/* ==================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ==================================================== */}
          {/* BUTTON */}
          {/* ==================================================== */}

          <button
            type="button"
            onClick={handleBeardTest}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />

                <span>
                  Analyzing & Generating...
                </span>
              </>
            ) : (
              <>
                <span className="text-lg">
                  🧔
                </span>

                <span>
                  Test Beard
                </span>
              </>
            )}
          </button>

        </section>

        {/* ====================================================== */}
        {/* RESULT */}
        {/* ====================================================== */}

        {resultImageUrl && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {/* RESULT HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Generated Result
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Hive generated image
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                Complete
              </div>

            </div>

            {/* RESULT IMAGE */}

            <div className="bg-black p-4">

              <img
                src={resultImageUrl}
                alt="Generated beard result"
                className="mx-auto max-h-[700px] w-full rounded-2xl object-contain"
              />

            </div>

            {/* RESULT URL */}

            <div className="border-t border-white/10 p-6">

              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                Result Image URL
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  value={resultImageUrl}
                  readOnly
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/60 outline-none"
                />

                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/15"
                >
                  {copied
                    ? "✓ Copied"
                    : "Copy URL"}
                </button>

              </div>

              <a
                href={resultImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-sm text-white/50 underline underline-offset-4 transition hover:text-white"
              >
                Open Result Image ↗
              </a>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}
