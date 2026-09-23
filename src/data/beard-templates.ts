// src/data/beard-templates.ts

// ═══════════════════════════════════════════════════════════
// BEARD TEMPLATES DATA
// ═══════════════════════════════════════════════════════════
//
// S3 path: lexa/beard_templates/
// CDN: https://d2rpzp0h8kdnc1.cloudfront.net
//
// Each template has a `prompt` field — a detailed description
// sent to OpenAI to apply that exact beard to the user's face.
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type BeardCategory =
  | "classic"
  | "modern"
  | "stubble"
  | "mustache"
  | "chinstrap"
  | "curly"
  | "sketch"
  | "illustrated";

export interface BeardTemplate {
  id: string;
  name: string;
  imageUrl: string;
  s3Key: string;
  category: BeardCategory;
  tagline?: string;
  featured?: boolean;
  /** 🎯 Detailed prompt used to apply this beard to the user's face */
  prompt: string;
}

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const CDN_BASE = "https://d2rpzp0h8kdnc1.cloudfront.net";
const S3_FOLDER = "lexa/beard_templates";

function buildUrl(filename: string): string {
  return `${CDN_BASE}/${S3_FOLDER}/${filename}.png`;
}

// ═══════════════════════════════════════════════════════════
// BEARD TEMPLATES — 20 templates with full prompts
// ═══════════════════════════════════════════════════════════

const BATCH_2: BeardTemplate[] = [
  {
    id: "b2-chinstrap",
    name: "Chinstrap",
    imageUrl: buildUrl("Batch2_01_Full_Beard_Chinstrap_Only"),
    s3Key: "Batch2_01_Full_Beard_Chinstrap_Only",
    category: "chinstrap",
    tagline: "Clean, sharp chinstrap",
    prompt: `Apply a SHARP CHINSTRAP BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thin, clean, connected to the chinstrap at the corners of the mouth
- Cheeks: completely clean-shaven (no hair on upper cheeks)
- Jaw: a thin, precisely-trimmed strap of dark hair (approximately 1–1.5 cm width) following the jawline from ear to ear, dipping under the chin
- Chin: strap continues smoothly across the chin
- Neckline: clean-shaven below the strap
- Sideburns: thin, connecting the chinstrap to the hairline

LENGTH: short, uniform (approximately 3–5 mm)

REALISM:
- Photorealistic individual hair strands, visible roots
- Natural dark brown to near-black color, subtle strand variation
- Fine natural growth direction along the jaw
- Realistic shadowing between the strap and the clean-shaven cheeks
- Natural skin-to-hair transition at every edge

The chinstrap must look deliberately groomed and shaped — a classic barbershop chinstrap beard.`,
  },
  {
    id: "b2-skin-closeup-lips",
    name: "Skin Closeup",
    imageUrl: buildUrl("Batch2_02_Full_Beard_Skin_Closeup_Lips"),
    s3Key: "Batch2_02_Full_Beard_Skin_Closeup_Lips",
    category: "classic",
    tagline: "Closeup detail",
    prompt: `Apply a CLOSE-CROPPED SHORT BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: neat, trimmed above the upper lip, natural dark brown
- Cheeks: covered by light, even stubble on the lower cheeks
- Jaw: dense but very short stubble following the jawline
- Chin: slightly denser coverage, still very short
- Neckline: clean, well-maintained neckline
- Sideburns: short, natural connection into the beard

LENGTH: approximately 2–4 mm

REALISM:
- Photorealistic individual short hairs, visible at closeup
- Natural dark brown color with subtle variation
- Even, dense distribution
- Realistic micro-detail on every strand
- Natural skin-to-hair transition

Overall appearance: clean, freshly-trimmed beard with a subtle masculine look — like a well-maintained 3-day growth.`,
  },
  {
  id: "b2-sketch-heart",
  name: "Sketch Heart",
  imageUrl: buildUrl("Batch2_03_Full_Beard_Sketch_Heart"),
  s3Key: "Batch2_03_Full_Beard_Sketch_Heart",
  category: "sketch",
  tagline: "Heart-soft sketch",
  prompt: `LEXA AI — BEARD STUDIO
PROFESSIONAL ISOLATED BEARD ASSET GENERATION PROMPT

TASK:
Generate ONE isolated professional facial-hair asset based precisely on the supplied reference image.

The output must be ONLY the beard and mustache.
This is a beard template asset for an AI virtual beard try-on system.

==================================================
BEARD STYLE — SKETCH HEART
==================================================

Create a medium-length, full, naturally dense beard with a clearly recognizable HEART-SHAPED overall silhouette.

The beard must look like realistic human facial hair while preserving the distinctive heart-shaped structure from the reference.

The defining characteristic is the heart silhouette:

- Two soft rounded upper cheek sections
- Two subtle upward-curving points toward the cheekbones
- Full dense jaw coverage
- A broad, rounded lower chin area
- The overall silhouette must read clearly as a soft natural heart shape
- The shape must remain masculine, realistic, and wearable
- Do not make the heart shape look geometric or artificial

The beard should have medium facial-hair length, approximately 1.5–2.5 cm.

==================================================
MUSTACHE
==================================================

Create a thick, full natural mustache connected seamlessly to the beard.

The mustache must:

- Cover the upper lip area completely
- Be naturally dense
- Connect directly into the beard at both sides
- Have realistic individual hairs
- Follow natural facial-hair growth direction
- Maintain balanced left and right proportions
- Blend naturally into the surrounding beard

The mustache should be substantial but NOT oversized.

Do not create an exaggerated handlebar mustache.

Do not make the mustache look separately attached.

==================================================
HEART-SHAPED CHEEKS
==================================================

The cheek structure is the most important feature of this beard.

Create full beard coverage across both cheeks.

The upper cheek edges should form two subtle upward curves that gently rise toward the cheekbones.

These two upward sections create the upper portions of the heart silhouette.

IMPORTANT:

The cheek points must be soft and natural.

They should NOT look like sharp horns.

They should NOT look like a geometric heart icon.

They should look like naturally growing facial hair that happens to form a recognizable heart-shaped silhouette.

The left and right sides should be visually balanced while retaining tiny natural differences between individual hairs.

==================================================
JAW STRUCTURE
==================================================

Create dense continuous coverage across:

- left cheek
- left jaw
- chin
- right jaw
- right cheek

The jaw should be full and naturally connected.

The beard should maintain medium length throughout the jaw.

The sides should gradually flow downward toward the chin.

There must be no unnatural gaps between the cheek, jaw, mustache, and chin regions.

==================================================
CHIN
==================================================

Create a full rounded chin section.

The lower beard should create the lower portion of the heart silhouette.

The chin should be:

- Full
- Rounded
- Dense
- Naturally tapered toward the lower edge
- Slightly fuller around the center

Do not create a sharp triangular beard point.

Do not create a long extended beard.

Do not make the chin excessively large.

The final silhouette should remain a soft heart rather than a pointed goatee.

==================================================
LENGTH
==================================================

Medium beard length.

Approximately 1.5–2.5 cm.

The hair should be clearly longer than stubble but shorter than a long/full Viking beard.

Maintain consistent medium density throughout the beard while allowing natural variations in individual strand length.

==================================================
HAIR CHARACTER
==================================================

Use highly realistic individual facial-hair strands.

Hair characteristics:

- Natural dark brown to near-black color
- Subtle tonal variation
- Medium-length individual strands
- Fine realistic hair fibers
- Slight natural waviness
- Natural growth direction
- Slight variations in strand thickness
- Slight variations in strand length
- Dense overlapping hairs
- Realistic curls and bends
- Fine flyaway hairs
- Natural irregularity around the edges
- Realistic strand intersections
- Realistic depth between hair layers

Do not make every strand identical.

Do not create repetitive procedural patterns.

Do not create perfectly parallel hair.

Every visible region must read as real human facial hair.

==================================================
REALISM
==================================================

Photorealistic facial hair.

Ultra-detailed individual hair strands.

Natural hair texture.

Realistic strand-level lighting.

Subtle highlights between individual hairs.

Natural dark-brown/black coloration.

Realistic density variation.

Realistic hair depth.

Realistic soft translucency on very fine hair tips.

Natural skin-to-hair transition should be represented ONLY where appropriate to the beard asset edges.

The final asset should look like genuine human facial hair isolated from a professional photograph.

NO:

- cartoon
- illustration
- painting
- vector art
- anime
- synthetic fur
- plastic hair
- smooth CGI hair
- artificial repeated patterns
- perfectly uniform strands
- fake geometric heart

==================================================
REFERENCE MATCH
==================================================

Preserve the defining characteristics of the supplied reference:

1. Medium-length full beard
2. Clearly recognizable heart-shaped silhouette
3. Full connected mustache
4. Full cheek coverage
5. Two subtle upward cheek points
6. Dense jaw coverage
7. Rounded lower chin
8. Natural dark facial-hair color
9. Realistic individual hair strands
10. Soft natural heart shape rather than a graphic heart icon
11. Front-facing symmetrical presentation
12. Natural facial-hair irregularity

The heart silhouette must remain clearly recognizable.

Do not simplify the shape.

Do not convert it into a standard full beard.

Do not convert it into a goatee.

Do not convert it into a chinstrap.

Do not convert it into stubble.

Do not make the beard excessively long.

Do not exaggerate the cheek points.

==================================================
ISOLATED ASSET REQUIREMENTS
==================================================

IMPORTANT:

Generate ONLY the beard and mustache.

DO NOT generate:

- face
- head
- skin
- lips
- mouth
- nose
- eyes
- eyebrows
- ears
- neck
- shoulders
- clothing
- human body
- person
- portrait

There must be absolutely no complete human face behind the beard.

The beard must exist as an independent compositing asset.

==================================================
TRANSPARENT BACKGROUND
==================================================

Use a completely transparent alpha background.

No solid background.

No green background.

No white background.

No black background.

No gray background.

No gradient.

No environment.

No studio backdrop.

No floor.

No visible shadow underneath the asset.

The entire area surrounding the beard must contain transparent pixels.

==================================================
EDGE QUALITY
==================================================

The outer beard boundary must be created from realistic individual hairs.

Do NOT create:

- hard cutout edges
- artificial borders
- white halos
- green halos
- dark outlines
- glowing edges
- painted edges

Fine facial hairs should naturally extend beyond the primary silhouette.

The outer edges should contain subtle individual flyaway hairs.

The alpha edge must remain clean and suitable for professional face compositing.

==================================================
CAMERA / COMPOSITION
==================================================

Front-facing orthographic presentation.

Perfectly centered.

Straight-on view.

No rotation.

No perspective distortion.

No camera angle.

No visible face.

No visible head.

The entire beard asset must fit comfortably inside the canvas.

Maintain generous transparent padding around the beard.

Keep the beard vertically centered.

Keep left and right sides visually balanced.

The heart-shaped silhouette must be fully visible from the upper cheek points to the bottom of the chin.

==================================================
LIGHTING
==================================================

Neutral professional studio lighting applied only to the hair.

Very subtle realistic highlights.

No dramatic colored lighting.

No rim-light glow.

No environmental reflections.

No visible light source.

The beard should remain predominantly dark brown/black.

Highlights should reveal individual strands without making the beard appear gray.

==================================================
OUTPUT QUALITY
==================================================

Ultra-high-resolution professional beard asset.

Maximum available hair detail.

Photorealistic individual facial-hair strands.

Clean alpha transparency.

Production-ready compositing asset.

Suitable for use as a beard reference/template inside LEXA AI Beard Studio.

The final image must look like a real medium-length heart-shaped beard isolated from a professional photograph, NOT like an illustration or graphic heart.

FINAL OUTPUT:
ONE beard asset only.
No text.
No labels.
No person.
No face.
No head.
No additional objects.
Transparent background.`,
},
 
  {
    id: "b2-sketch-rounded",
    name: "Sketch Rounded",
    imageUrl: buildUrl("Batch2_04_Full_Beard_Sketch_Rounded"),
    s3Key: "Batch2_04_Full_Beard_Sketch_Rounded",
    category: "sketch",
    tagline: "Rounded sketch style",
    prompt: `Apply a FULL ROUNDED BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: medium thickness, natural, covering the upper lip
- Cheeks: moderate coverage with a smooth, softly curved cheek line
- Jaw: full coverage with a smooth, rounded outer edge
- Chin: rounded bottom (no points) forming the base of a smooth oval silhouette
- Neckline: natural, softly fading into the neck
- Sideburns: connected smoothly to the beard

LENGTH: medium (approximately 1–2 cm)

SHAPE: A smooth, rounded silhouette — no sharp edges or points. The beard looks deliberately shaped into an even oval.

REALISM:
- Photorealistic individual hair strands
- Natural dark brown color
- Even density throughout
- Natural soft edges at cheek lines and neckline
- Realistic skin-to-hair transition

The overall look should feel natural and groomed, with a clean rounded shape.`,
  },
  {
    id: "b2-dark-curly",
    name: "Dark Curly",
    imageUrl: buildUrl("Batch2_05_Full_Beard_Dark_Curly"),
    s3Key: "Batch2_05_Full_Beard_Dark_Curly",
    category: "curly",
    tagline: "Rich, curly texture",
    featured: true,
    prompt: `Apply a DENSE DARK CURLY FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, curly, covering the entire upper lip, connected to the beard
- Cheeks: full coverage with natural curls creating volume
- Jaw: dense curls following the jawline
- Chin: full, curly volume
- Neckline: natural fade at the neck
- Sideburns: connected into the beard with visible curl texture

LENGTH: medium-to-long (approximately 2–4 cm)

TEXTURE: STRONG NATURAL CURLS throughout — tight coils give the beard volume and shape. Every strand should look individually curled. The beard has natural wave movement.

COLOR: Rich dark brown to near-black with subtle warm highlights.

REALISM:
- Photorealistic individual curly strands
- Visible curls at close inspection
- Natural density variation
- Realistic roots, flyaways, and volume
- Natural skin-to-hair transition

Overall: A dense, masculine, curly beard with clear volume and rich texture.`,
  },
  {
    id: "b2-sketch-soft",
    name: "Sketch Soft",
    imageUrl: buildUrl("Batch2_06_Full_Beard_Sketch_Soft"),
    s3Key: "Batch2_06_Full_Beard_Sketch_Soft",
    category: "sketch",
    tagline: "Soft natural strokes",
    prompt: `Apply a SOFT-EDGED MEDIUM BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: light-to-medium thickness, natural, covering the upper lip
- Cheeks: moderate coverage with soft, natural cheek lines (no harsh edges)
- Jaw: even coverage with a soft, natural outer edge
- Chin: gently rounded bottom
- Neckline: soft, natural fade into the neck
- Sideburns: connected to the beard naturally

LENGTH: medium (approximately 1–2 cm)

SHAPE: Soft, natural silhouette — no sharp lines, no hard edges. The beard looks like it naturally grew this way and was gently groomed.

REALISM:
- Photorealistic individual hair strands
- Natural dark brown color
- Even density with subtle variation
- Natural, soft transitions at every edge
- Realistic skin-to-hair transition

Overall: A soft, approachable, natural-looking beard with warm tones and gentle edges.`,
  },
  {
    id: "b2-sketch-classic",
    name: "Sketch Classic",
    imageUrl: buildUrl("Batch2_07_Full_Beard_Sketch_Classic"),
    s3Key: "Batch2_07_Full_Beard_Sketch_Classic",
    category: "sketch",
    tagline: "Traditional sketch",
    prompt: `Apply a CLASSIC FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: full, thick, covering the upper lip, connected to the beard
- Cheeks: full coverage with distinct, natural cheek lines
- Jaw: dense, full coverage following the jawline
- Chin: full coverage with a slightly rounded or slightly squared bottom
- Neckline: clean, natural neckline
- Sideburns: connected to the beard

LENGTH: medium-to-long (approximately 2–3 cm)

SHAPE: A traditional, well-groomed full beard — masculine silhouette, natural proportions.

REALISM:
- Photorealistic individual hair strands
- Natural dark brown color
- Even density with subtle variation
- Natural growth direction
- Realistic roots, flyaways
- Skin-to-hair transition at all edges

Overall: A classic, timeless, well-groomed full beard — the kind you'd see on a modern gentleman.`,
  },
  {
    id: "b2-with-skin-full",
    name: "Full Beard Complete",
    imageUrl: buildUrl("Batch2_08_Full_Beard_With_Skin_Full"),
    s3Key: "Batch2_08_Full_Beard_With_Skin_Full",
    category: "classic",
    tagline: "Complete natural beard",
    prompt: `Apply a THICK COMPLETE FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, full, covering the entire upper lip, connected to the beard
- Cheeks: dense coverage extending up to distinct cheek lines
- Jaw: dense, thick coverage
- Chin: full, dense coverage
- Neckline: extends partially down the neck with a natural curve
- Sideburns: fully connected to the beard

LENGTH: medium-to-long (approximately 2–4 cm)

DENSITY: Full, dense, thick — one of the fullest beard styles.

COLOR: Rich dark brown with subtle warm variation.

REALISM:
- Photorealistic individual hair strands
- Natural density variation across the beard
- Visible roots, individual strands, slight flyaways
- Natural growth direction
- Realistic skin-to-hair transition

Overall: A very full, masculine, well-grown beard — the kind of beard that covers the entire lower face.`,
  },
  {
    id: "b2-with-skin-wide",
    name: "Full Beard Wide",
    imageUrl: buildUrl("Batch2_09_Full_Beard_With_Skin_Wide"),
    s3Key: "Batch2_09_Full_Beard_With_Skin_Wide",
    category: "classic",
    tagline: "Wide full coverage",
    prompt: `Apply a WIDE FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, full, wide coverage of the upper lip
- Cheeks: high cheek lines with wide coverage — the beard extends broadly across the cheeks
- Jaw: wide, full coverage
- Chin: dense, full coverage
- Neckline: naturally tapered to the neck
- Sideburns: connected widely into the beard

LENGTH: medium-to-long (approximately 2–3 cm)

SHAPE: WIDE and full — the beard extends broadly across the face, giving a bold masculine look.

COLOR: Dark brown, rich and warm.

REALISM:
- Photorealistic individual hair strands
- Natural density variation
- Visible roots and natural flow
- Realistic skin-to-hair transition

Overall: A wide, full, masculine beard giving the face a bold frame.`,
  },
  {
    id: "b2-dark-classic",
    name: "Dark Classic",
    imageUrl: buildUrl("Batch2_10_Full_Beard_Dark_Classic"),
    s3Key: "Batch2_10_Full_Beard_Dark_Classic",
    category: "classic",
    tagline: "Bold dark beard",
    featured: true,
    prompt: `Apply a BOLD DARK CLASSIC BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, dark, covering the upper lip, connected to the beard
- Cheeks: dense coverage with distinct, natural cheek lines
- Jaw: dense coverage following the jawline
- Chin: full, dense coverage with a natural rounded or squared silhouette
- Neckline: clean, natural fade into the neck
- Sideburns: connected to the beard

LENGTH: medium (approximately 2–3 cm)

COLOR: Very dark — almost black with subtle dark brown undertones.

REALISM:
- Photorealistic individual hair strands
- Visible roots, natural density variation
- Natural growth direction
- Subtle strand-level highlight from the lighting
- Realistic skin-to-hair transition

Overall: A bold, dark, masculine full beard — imposing but well-groomed.`,
  },
  {
    id: "b2-sketch-dark-rounded",
    name: "Sketch Dark Rounded",
    imageUrl: buildUrl("Batch2_11_Full_Beard_Sketch_Dark_Rounded"),
    s3Key: "Batch2_11_Full_Beard_Sketch_Dark_Rounded",
    category: "sketch",
    tagline: "Dark rounded sketch",
    prompt: `Apply a DARK ROUNDED FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, dark, covering the upper lip
- Cheeks: dense coverage with a smooth, softly curved cheek line
- Jaw: dense, full coverage
- Chin: rounded bottom — no points, no sharp edges
- Neckline: natural, softly fading into the neck
- Sideburns: connected to the beard

LENGTH: medium (approximately 1.5–2.5 cm)

SHAPE: A smooth rounded silhouette — the outer edge forms a gentle oval.

COLOR: Very dark brown to nearly black.

REALISM:
- Photorealistic individual hair strands
- Visible roots, natural density
- Realistic growth direction
- Warm realistic lighting
- Natural skin-to-hair transition

Overall: A dark, dense, rounded beard with a soft masculine silhouette.`,
  },
  {
    id: "b2-mustache-with-skin",
    name: "Mustache With Skin",
    imageUrl: buildUrl("Batch2_12_Full_Beard_Mustache_With_Skin"),
    s3Key: "Batch2_12_Full_Beard_Mustache_With_Skin",
    category: "mustache",
    tagline: "Focused mustache",
    prompt: `Apply a PROMINENT FULL MUSTACHE to the person's face (with minimal or no beard on cheeks/jaw).

BEARD STRUCTURE:
- Mustache: thick, full, prominent — covers the entire upper lip from corner to corner, well-groomed, natural dark brown
- Cheeks: clean-shaven or lightly stubbled
- Jaw: clean-shaven or lightly stubbled
- Chin: clean-shaven or lightly stubbled
- Neckline: clean
- Sideburns: minimal or absent

LENGTH of mustache: medium — thick but not exaggerated, roughly 1–1.5 cm

COLOR: Rich dark brown.

REALISM:
- Photorealistic individual hair strands on the mustache
- Natural direction of growth (from center of lip outward)
- Visible roots, individual hairs
- Realistic shadow under the mustache
- Natural skin-to-hair transition on the upper lip

Overall: The mustache is the focal feature — bold and masculine, while the rest of the face is mostly clean.`,
  },
  {
    id: "b2-dark-illustrated",
    name: "Dark Illustrated",
    imageUrl: buildUrl("Batch2_13_Full_Beard_Dark_Illustrated"),
    s3Key: "Batch2_13_Full_Beard_Dark_Illustrated",
    category: "illustrated",
    tagline: "Illustrated dark style",
    prompt: `Apply a BOLD DARK FULL BEARD with strong definition to the person's face.

BEARD STRUCTURE:
- Mustache: thick, dark, covering the upper lip
- Cheeks: dense coverage with clearly defined, sharp cheek lines
- Jaw: dense, full coverage following the jawline
- Chin: full, dense coverage with strong definition
- Neckline: clearly defined neckline
- Sideburns: connected to the beard

LENGTH: medium (approximately 2–3 cm)

SHAPE: Bold, masculine with strong clean outer edges.

COLOR: Very dark (near black) with warm undertones.

REALISM:
- Photorealistic individual hair strands
- Strong contrast between beard and clean skin
- Visible roots, natural density
- Realistic warm cinematic lighting
- Natural skin-to-hair transition

Overall: A dark, dense, high-definition full beard with strong visual impact.`,
  },
  {
    id: "b2-thin-with-skin",
    name: "Thin With Skin",
    imageUrl: buildUrl("Batch2_14_Full_Beard_Thin_With_Skin"),
    s3Key: "Batch2_14_Full_Beard_Thin_With_Skin",
    category: "modern",
    tagline: "Slim beard line",
    prompt: `Apply a THIN MODERN BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: light-to-medium, trimmed above the upper lip
- Cheeks: clean-shaven OR only a thin line of beard near the jawline
- Jaw: a thin, precisely-trimmed beard following the jaw closely — approximately 5–8 mm width
- Chin: thin coverage on the chin
- Neckline: sharp, clean-shaven below the beard line
- Sideburns: light, connected with a subtle fade

LENGTH: short (approximately 3–5 mm)

SHAPE: A slim, modern, minimal beard — hugging the jawline closely.

COLOR: Dark brown.

REALISM:
- Photorealistic individual hair strands
- Visible natural density
- Realistic skin-to-hair transition at every edge
- Clean, sharp beard edges

Overall: A minimalist, modern, slim beard — understated and sharp.`,
  },
  {
    id: "b2-curly-textured",
    name: "Curly Textured",
    imageUrl: buildUrl("Batch2_15_Full_Beard_Curly_Textured"),
    s3Key: "Batch2_15_Full_Beard_Curly_Textured",
    category: "curly",
    tagline: "Textured curl detail",
    featured: true,
    prompt: `Apply a TEXTURED CURLY FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, curly, covering the entire upper lip
- Cheeks: full coverage with strong curl texture creating volume
- Jaw: dense curly coverage following the jawline
- Chin: full, curly volume
- Neckline: natural fade at the neck
- Sideburns: connected with visible curl texture

LENGTH: medium-to-long (approximately 2–4 cm)

TEXTURE: STRONG NATURAL CURLS — thick, textured curls throughout the beard. Individual curls should be clearly visible, especially at the outer edges, giving the beard a rich, voluminous, textured appearance.

COLOR: Rich dark brown with warm undertones.

REALISM:
- Photorealistic individual curled strands
- Visible curl clusters at the edges
- Natural density variation
- Realistic roots, flyaway curls
- Realistic skin-to-hair transition

Overall: A dense, voluminous, richly textured curly beard.`,
  },
  {
    id: "b2-classic-medium",
    name: "Classic Medium",
    imageUrl: buildUrl("Batch2_16_Full_Beard_Classic_Medium"),
    s3Key: "Batch2_16_Full_Beard_Classic_Medium",
    category: "classic",
    tagline: "Balanced classic length",
    prompt: `Apply a CLASSIC MEDIUM-LENGTH FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: medium-thick, natural, covering the upper lip, connected to the beard
- Cheeks: moderate coverage with natural cheek lines
- Jaw: even coverage following the jawline
- Chin: medium-length coverage with natural rounded or slightly squared bottom
- Neckline: natural, clean fade
- Sideburns: connected to the beard

LENGTH: medium (approximately 1.5–2.5 cm)

SHAPE: A balanced, natural, classic full beard — masculine but not oversized.

COLOR: Natural dark brown.

REALISM:
- Photorealistic individual hair strands
- Visible roots and natural density
- Realistic growth direction
- Natural shine
- Skin-to-hair transition at all edges

Overall: A well-groomed, balanced, classic medium beard — a timeless everyday look.`,
  },
  {
    id: "b2-light-stubble",
    name: "Light Stubble",
    imageUrl: buildUrl("Batch2_17_Full_Beard_Light_Stubble_Skin"),
    s3Key: "Batch2_17_Full_Beard_Light_Stubble_Skin",
    category: "stubble",
    tagline: "Fresh stubble look",
    prompt: `Apply LIGHT, FRESH STUBBLE to the person's face.

BEARD STRUCTURE:
- Mustache: light stubble on the upper lip, natural
- Cheeks: light, even stubble covering the cheeks and jaw
- Jaw: light stubble following the jawline
- Chin: light stubble on the chin
- Neckline: light natural stubble, subtle
- Sideburns: light stubble connecting to the hairline

LENGTH: very short — approximately 1–3 mm

DENSITY: low, evenly distributed — a subtle shadow of beard rather than full hair.

COLOR: Dark brown stubble against the skin.

REALISM:
- Photorealistic tiny individual hair strands visible against the skin
- Fine natural growth direction
- Natural density variation (a touch more on chin and mustache)
- Realistic micro-shadowing of stubble on the skin
- Natural skin-to-hair transition

Overall: A fresh, effortless, understated stubble — like 2–3 days of natural growth that looks intentionally maintained.`,
  },
  {
    id: "b2-sketch-heart-b",
    name: "Sketch Heart B",
    imageUrl: buildUrl("Batch2_18_Full_Beard_Sketch_Heart_B"),
    s3Key: "Batch2_18_Full_Beard_Sketch_Heart_B",
    category: "sketch",
    tagline: "Alternative heart sketch",
    prompt: `Apply a FULL HEART-SHAPED BEARD to the person's face (alternate variation).

BEARD STRUCTURE:
- Mustache: thick, full, covering the entire upper lip
- Cheeks: full coverage with two distinct upward curls at the top near the cheekbones — these create the top of the heart
- Jaw: dense full coverage following the jawline
- Chin: rounded at the bottom, forming the lower point of the heart
- Neckline: natural, soft fade
- Sideburns: connected into the beard

LENGTH: medium (approximately 2–3 cm)

SHAPE: A clear HEART silhouette — rounded at the chin, with two soft upward curls at the top of the beard near the cheek lines.

COLOR: Dark brown.

REALISM:
- Photorealistic individual hair strands
- Natural density and volume
- Realistic roots and growth direction
- Natural skin-to-hair transition
- The heart shape must look natural and groomed — not pasted on

Overall: A full, dense, heart-shaped beard with a distinctive romantic silhouette.`,
  },
  {
    id: "b2-with-skin-natural",
    name: "Natural Beard",
    imageUrl: buildUrl("Batch2_19_Full_Beard_With_Skin_Natural"),
    s3Key: "Batch2_19_Full_Beard_With_Skin_Natural",
    category: "classic",
    tagline: "Natural, subtle style",
    featured: true,
    prompt: `Apply a NATURAL MID-LENGTH FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: natural medium thickness, covering the upper lip, connected to the beard
- Cheeks: natural coverage extending up the cheeks with soft, natural cheek lines
- Jaw: natural coverage following the jawline
- Chin: natural medium coverage
- Neckline: natural fade into the neck with a soft curve
- Sideburns: naturally connected

LENGTH: medium (approximately 1.5–2.5 cm)

SHAPE: Natural, unforced silhouette — not overly styled, not too sharp, just natural masculine growth.

COLOR: Dark brown with subtle warm tones.

REALISM:
- Photorealistic individual hair strands
- Natural density variation throughout
- Realistic roots, flyaways, slight natural asymmetry
- Realistic growth direction
- Natural warm sheen under the lighting
- Realistic skin-to-hair transition

Overall: A natural, subtle, effortless-looking beard — the kind that seems to grow effortlessly.`,
  },
  {
    id: "b2-dark-wavy",
    name: "Dark Wavy",
    imageUrl: buildUrl("Batch2_20_Full_Beard_Dark_Wavy"),
    s3Key: "Batch2_20_Full_Beard_Dark_Wavy",
    category: "curly",
    tagline: "Flowing dark waves",
    prompt: `Apply a DENSE DARK WAVY FULL BEARD to the person's face.

BEARD STRUCTURE:
- Mustache: thick, wavy, covering the upper lip, connected to the beard
- Cheeks: full coverage with soft waves creating natural volume
- Jaw: dense wavy coverage following the jawline
- Chin: full wavy volume
- Neckline: natural fade into the neck
- Sideburns: connected with visible wave texture

LENGTH: medium-to-long (approximately 2–3.5 cm)

TEXTURE: NATURAL WAVES throughout the beard — soft, flowing waves that give the beard movement and volume, distinct from tight curls but clearly wavy.

COLOR: Rich dark brown with warm undertones.

REALISM:
- Photorealistic individual wavy hair strands
- Visible wave flow at the outer edges
- Natural density variation
- Realistic roots, natural wave direction
- Realistic skin-to-hair transition

Overall: A dense, masculine, wavy beard — flowing and full with natural wave movement.`,
  },
];

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export const beardTemplates: BeardTemplate[] = [...BATCH_2];
export const beardTemplatesBatch2 = BATCH_2;

export type BeardTemplateId = (typeof beardTemplates)[number]["id"];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function getBeardTemplateById(id: string): BeardTemplate | undefined {
  return beardTemplates.find((t) => t.id === id);
}

export function getBeardTemplatesByCategory(
  category: BeardCategory
): BeardTemplate[] {
  return beardTemplates.filter((t) => t.category === category);
}

export function getFeaturedBeardTemplates(): BeardTemplate[] {
  return beardTemplates.filter((t) => t.featured);
}

export function getAvailableBeardCategories(): BeardCategory[] {
  return Array.from(new Set(beardTemplates.map((t) => t.category)));
}

export function getBeardTemplateCount(): number {
  return beardTemplates.length;
}