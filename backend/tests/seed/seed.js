#!/usr/bin/env node

/**
 * Seed script for creating users and uploading videos.
 *
 * Usage example:
 * node backend/tests/seed/seed.js \
 *   --api http://localhost:8080/api \
 *   --users 5 \
 *   --videos 3 \
 *   --dir backend/tests/seed/videos \
 *   --preview-dir backend/tests/seed/previews \
 *   --avatar-dir backend/tests/seed/avatars \
 *   --title-template "Видео {u}-{v} ({file})" \
 *   --description-template "Описание для u={u}, v={v}" \
 *   --tags "seed,author_{u},video_{v}" \
 *   --generated-durations "3,15,45,90" \
 *   --test-cases mixed \
 *   --password Qwerty123! \
 *   --prefix seed_user
 *
 * If --dir / --preview-dir / --avatar-dir are omitted, files are generated via ffmpeg.
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULTS = {
  api: "http://localhost:8080/api",
  users: 5,
  videos: 3,
  dir: "",
  previewDir: "",
  avatarDir: "",
  titleTemplate: "seed_u{u}_v{v}",
  descriptionTemplate: "seed upload user={u} video={v}",
  tags: "seed,u{u},v{v}",
  password: "Qwerty123!",
  prefix: "seed_user",
  generatedDurations: "3,15,45,90",
  testCases: "",
};

const AVATAR_COLORS = [
  "0x2563EB",
  "0x7C3AED",
  "0x059669",
  "0xD97706",
  "0xDC2626",
  "0x0F766E",
  "0xBE185D",
  "0x334155",
  "0x1D4ED8",
  "0x9333EA",
];

const DEFAULT_VIDEO_CASE = {
  key: "default",
  withDescription: true,
  withTags: true,
};

const TEST_CASE_PROFILES = {
  mixed: {
    userAvatarMode: "alternate",
    videoCases: [
      { key: "full", withDescription: true, withTags: true },
      { key: "no_description", withDescription: false, withTags: true },
      { key: "no_tags", withDescription: true, withTags: false },
      { key: "minimal", withDescription: false, withTags: false },
    ],
  },
  minimal: {
    userAvatarMode: "none",
    videoCases: [{ key: "minimal", withDescription: false, withTags: false }],
  },
  rich: {
    userAvatarMode: "all",
    videoCases: [{ key: "full", withDescription: true, withTags: true }],
  },
};

function parseArgs(argv) {
  const out = { ...DEFAULTS };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value == null || value.startsWith("--")) continue;

    if (key === "api") out.api = value;
    if (key === "users") out.users = Number(value);
    if (key === "videos") out.videos = Number(value);
    if (key === "dir") out.dir = value;
    if (key === "preview-dir") out.previewDir = value;
    if (key === "avatar-dir") out.avatarDir = value;
    if (key === "title-template") out.titleTemplate = value;
    if (key === "description-template") out.descriptionTemplate = value;
    if (key === "tags") out.tags = value;
    if (key === "password") out.password = value;
    if (key === "prefix") out.prefix = value;
    if (key === "generated-durations") out.generatedDurations = value;
    if (key === "test-cases") out.testCases = value;
    i += 1;
  }
  return out;
}

function parseDurations(raw) {
  const parsed = String(raw || "")
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
  return parsed.length > 0 ? parsed : [3];
}

function resolveTestCaseProfile(name) {
  if (!name) return null;
  return TEST_CASE_PROFILES[name] || null;
}

function shouldUploadAvatarForUser(userIndex, mode) {
  if (mode === "all") return true;
  if (mode === "none") return false;
  // alternate: 1st user with avatar, 2nd without, etc.
  return userIndex % 2 === 1;
}

function escapeDrawText(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(":", "\\:")
    .replaceAll("'", "\\'")
    .replaceAll("%", "\\%");
}

function sanitizeFilePart(value) {
  return String(value || "")
    .replaceAll(/[^a-zA-Z0-9_-]+/g, "_")
    .replaceAll(/_+/g, "_")
    .slice(0, 80);
}

function isSuccessStatus(status) {
  return status >= 200 && status < 300;
}

function getSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function updateCookieJarFromResponse(headers, jar) {
  const setCookies = getSetCookieHeaders(headers);
  for (const raw of setCookies) {
    const first = raw.split(";")[0];
    const eq = first.indexOf("=");
    if (eq < 0) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    if (!name) continue;
    if (!value) {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }
}

function buildCookieHeader(jar) {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function requestJSON(url, init = {}, jar) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (jar && jar.size > 0) {
    headers.set("Cookie", buildCookieHeader(jar));
  }

  const res = await fetch(url, { ...init, headers });
  if (jar) {
    updateCookieJarFromResponse(res.headers, jar);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function requestForm(url, formData, jar) {
  const headers = new Headers();
  if (jar && jar.size > 0) {
    headers.set("Cookie", buildCookieHeader(jar));
  }

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });
  if (jar) {
    updateCookieJarFromResponse(res.headers, jar);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

function extToMime(ext) {
  switch (ext.toLowerCase()) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".avi":
      return "video/x-msvideo";
    case ".mkv":
      return "video/x-matroska";
    default:
      return "application/octet-stream";
  }
}

function imageExtToMime(ext) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function getVideoFiles(dir) {
  if (!dir) return [];
  const abs = path.resolve(dir);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  const allowed = new Set([".mp4", ".webm", ".mov", ".avi", ".mkv"]);
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(abs, e.name))
    .filter((p) => allowed.has(path.extname(p).toLowerCase()));
}

async function getImageFiles(dir) {
  if (!dir) return [];
  const abs = path.resolve(dir);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp"]);
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(abs, e.name))
    .filter((p) => allowed.has(path.extname(p).toLowerCase()));
}

async function createTestMP4(outPath, durationSeconds = 1) {
  // Mirrors backend/internal/testutil/CreateTestMP4.
  await execFileAsync("ffmpeg", [
    "-f", "lavfi",
    "-i", `color=c=black:s=480x360:d=${durationSeconds}`,
    "-f", "lavfi",
    "-i", "anullsrc",
    "-shortest",
    "-c:v", "libx264",
    "-c:a", "aac",
    outPath,
    "-y",
  ]);
}

async function createTestPreview(outPath, title) {
  const safeTitle = escapeDrawText(title || "Видео");
  try {
    await execFileAsync("ffmpeg", [
      "-f", "lavfi",
      "-i", "color=c=black:s=1280x720:d=1",
      "-vf",
      `drawtext=fontcolor=white:fontsize=54:text='${safeTitle}':x=(w-text_w)/2:y=(h-text_h)/2`,
      "-frames:v", "1",
      outPath,
      "-y",
    ]);
  } catch {
    // Fallback for ffmpeg builds without drawtext filter.
    await execFileAsync("ffmpeg", [
      "-f", "lavfi",
      "-i", "color=c=black:s=1280x720:d=1",
      "-frames:v", "1",
      outPath,
      "-y",
    ]);
  }
}

async function createTestAvatar(outPath, letter, color) {
  const safeLetter = escapeDrawText((letter || "U").slice(0, 1).toUpperCase());
  try {
    await execFileAsync("ffmpeg", [
      "-f", "lavfi",
      "-i", `color=c=${color}:s=512x512:d=1`,
      "-vf",
      `drawtext=fontcolor=white:fontsize=250:text='${safeLetter}':x=(w-text_w)/2:y=(h-text_h)/2`,
      "-frames:v", "1",
      outPath,
      "-y",
    ]);
  } catch {
    await execFileAsync("ffmpeg", [
      "-f", "lavfi",
      "-i", `color=c=${color}:s=512x512:d=1`,
      "-frames:v", "1",
      outPath,
      "-y",
    ]);
  }
}

async function ensureGeneratedAssetsIfNeeded(opts) {
  let generatedRoot = "";
  const videosCount = Math.max(1, Number(opts.videos) || 1);
  const usersCount = Math.max(1, Number(opts.users) || 1);
  const durations = parseDurations(opts.generatedDurations);

  if (!opts.dir) {
    generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-"));
    const videosDir = path.join(generatedRoot, "videos");
    await fs.mkdir(videosDir, { recursive: true });

    for (let i = 1; i <= videosCount; i += 1) {
      const duration = durations[(i - 1) % durations.length];
      await createTestMP4(path.join(videosDir, `generated_${i}_${duration}s.mp4`), duration);
    }
    opts.dir = videosDir;
  }

  if (!opts.previewDir) {
    if (!generatedRoot) {
      generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-"));
    }
    const previewsDir = path.join(generatedRoot, "previews");
    await fs.mkdir(previewsDir, { recursive: true });
    opts.previewDir = previewsDir;
    opts._generatedPreviewDir = previewsDir;
  }

  if (!opts.avatarDir) {
    if (!generatedRoot) {
      generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-"));
    }
    const avatarsDir = path.join(generatedRoot, "avatars");
    await fs.mkdir(avatarsDir, { recursive: true });

    for (let i = 1; i <= usersCount; i += 1) {
      const username = `${opts.prefix}_${i}`;
      const color = AVATAR_COLORS[(i - 1) % AVATAR_COLORS.length];
      const letter = username[0] || "U";
      await createTestAvatar(path.join(avatarsDir, `generated_avatar_${i}.png`), letter, color);
    }
    opts.avatarDir = avatarsDir;
  }

  return generatedRoot;
}

function renderTemplate(template, context) {
  return String(template)
    .replaceAll("{u}", String(context.u))
    .replaceAll("{v}", String(context.v))
    .replaceAll("{case}", context.case || "")
    .replaceAll("{file}", context.file || "")
    .replaceAll("{ext}", context.ext || "");
}

function buildTags(tagsRaw, context) {
  const rawItems = String(tagsRaw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (rawItems.length === 0) return ["seed"];
  return rawItems.map((t) => renderTemplate(t, context));
}

async function signup(apiBase, username, email, password) {
  const { res, body } = await requestJSON(`${apiBase}/signup`, {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  if (isSuccessStatus(res.status)) return;

  // Existing email is acceptable for repeated runs.
  const msg = (body && body.error) || "";
  if (res.status === 400 && /email already registered/i.test(msg)) return;

  throw new Error(`signup failed (${res.status}): ${JSON.stringify(body)}`);
}

async function login(apiBase, email, password, jar) {
  const { res, body } = await requestJSON(
    `${apiBase}/login`,
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    jar,
  );

  if (!isSuccessStatus(res.status)) {
    throw new Error(`login failed (${res.status}): ${JSON.stringify(body)}`);
  }
}

async function getCurrentUser(apiBase, jar) {
  const { res, body } = await requestJSON(`${apiBase}/me`, { method: "GET" }, jar);
  if (!isSuccessStatus(res.status)) {
    throw new Error(`get me failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

function extractUserId(user) {
  if (!user || typeof user !== "object") return "";
  return (
    user.user_id ||
    user.userId ||
    user.UserId ||
    user.id ||
    user.ID ||
    ""
  );
}

async function uploadAvatar(apiBase, jar, userId, avatarPath) {
  const fileName = path.basename(avatarPath);
  const ext = path.extname(fileName);
  const bytes = await fs.readFile(avatarPath);
  const blob = new Blob([bytes], { type: imageExtToMime(ext) });

  const form = new FormData();
  form.append("avatar", blob, fileName);

  const { res, body } = await requestForm(`${apiBase}/user/${userId}/upload`, form, jar);
  if (!isSuccessStatus(res.status)) {
    throw new Error(`avatar upload failed (${res.status}): ${JSON.stringify(body)}`);
  }
}

async function uploadVideo(apiBase, jar, filePath, previewPath, context, opts, videoCase) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  const bytes = await fs.readFile(filePath);
  const blob = new Blob([bytes], { type: extToMime(ext) });

  const form = new FormData();
  form.append("video", blob, fileName);
  form.append("name", renderTemplate(opts.titleTemplate, context));
  if (videoCase.withDescription) {
    form.append("description", renderTemplate(opts.descriptionTemplate, context));
  }

  if (videoCase.withTags) {
    for (const tag of buildTags(opts.tags, context)) {
      form.append("tags[]", tag);
    }
  }

  const previewName = path.basename(previewPath);
  const previewExt = path.extname(previewName);
  const previewBytes = await fs.readFile(previewPath);
  const previewBlob = new Blob([previewBytes], { type: imageExtToMime(previewExt) });
  form.append("preview", previewBlob, previewName);

  const { res, body } = await requestForm(`${apiBase}/video/upload`, form, jar);
  if (!isSuccessStatus(res.status)) {
    throw new Error(`upload failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!Number.isFinite(opts.users) || opts.users <= 0) {
    throw new Error("--users must be > 0");
  }
  if (!Number.isFinite(opts.videos) || opts.videos <= 0) {
    throw new Error("--videos must be > 0");
  }
  const testCaseProfile = resolveTestCaseProfile(opts.testCases);
  if (opts.testCases && !testCaseProfile) {
    throw new Error(`unknown --test-cases value "${opts.testCases}". Available: ${Object.keys(TEST_CASE_PROFILES).join(", ")}`);
  }

  const generatedRoot = await ensureGeneratedAssetsIfNeeded(opts);

  const videoFiles = await getVideoFiles(opts.dir);
  if (videoFiles.length === 0) {
    throw new Error(`no video files found in ${path.resolve(opts.dir)}`);
  }
  const previewFiles = await getImageFiles(opts.previewDir);
  const avatarFiles = await getImageFiles(opts.avatarDir);

  console.log(`[seed] api=${opts.api}`);
  console.log(`[seed] users=${opts.users}, videosPerUser=${opts.videos}`);
  console.log(`[seed] sourceFiles=${videoFiles.length}`);
  console.log(`[seed] previewFiles=${previewFiles.length}`);
  console.log(`[seed] avatarFiles=${avatarFiles.length}`);
  console.log(`[seed] generatedDurations=${parseDurations(opts.generatedDurations).join(",")}`);
  console.log(`[seed] testCases=${opts.testCases || "off"}`);
  if (generatedRoot) {
    console.log(`[seed] generatedAssetsDir=${generatedRoot}`);
  }

  let uploadsTotal = 0;
  const generatedPreviewCache = new Map();
  for (let i = 1; i <= opts.users; i += 1) {
    const email = `${opts.prefix}_${i}@test.local`;
    const username = `${opts.prefix}_${i}`;
    const jar = new Map();

    await signup(opts.api, username, email, opts.password);
    await login(opts.api, email, opts.password, jar);
    const me = await getCurrentUser(opts.api, jar);
    const userId = extractUserId(me);
    if (!userId) {
      throw new Error(`user id not found in /me response for user ${email}`);
    }

    const shouldUploadAvatar =
      avatarFiles.length > 0 &&
      shouldUploadAvatarForUser(i, testCaseProfile?.userAvatarMode || "all");

    if (shouldUploadAvatar) {
      const avatarPath = avatarFiles[(i - 1) % avatarFiles.length];
      await uploadAvatar(opts.api, jar, userId, avatarPath);
      console.log(`[seed] avatar uploaded u=${i} file=${path.basename(avatarPath)}`);
    } else if (avatarFiles.length > 0) {
      console.log(`[seed] avatar skipped u=${i}`);
    }

    for (let j = 1; j <= opts.videos; j += 1) {
      const videoCase = testCaseProfile
        ? testCaseProfile.videoCases[(j - 1) % testCaseProfile.videoCases.length]
        : DEFAULT_VIDEO_CASE;
      const filePath = videoFiles[(j - 1) % videoFiles.length];
      const context = {
        u: i,
        v: j,
        case: videoCase.key,
        file: path.basename(filePath, path.extname(filePath)),
        ext: path.extname(filePath).replace(".", ""),
      };
      const renderedTitle = renderTemplate(opts.titleTemplate, context);
      let previewPath = "";
      if (previewFiles.length > 0) {
        previewPath = previewFiles[(j - 1) % previewFiles.length];
      } else if (opts._generatedPreviewDir) {
        const cacheKey = `${i}:${j}:${renderedTitle}`;
        const cached = generatedPreviewCache.get(cacheKey);
        if (cached) {
          previewPath = cached;
        } else {
          const fileSafe = sanitizeFilePart(`u${i}_v${j}_${renderedTitle}`);
          const generatedPath = path.join(opts._generatedPreviewDir, `${fileSafe}.jpg`);
          await createTestPreview(generatedPath, renderedTitle);
          generatedPreviewCache.set(cacheKey, generatedPath);
          previewPath = generatedPath;
        }
      }

      if (!previewPath) {
        if (!opts._generatedPreviewDir) {
          const generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-preview-"));
          opts._generatedPreviewDir = path.join(generatedRoot, "previews");
          await fs.mkdir(opts._generatedPreviewDir, { recursive: true });
        }
        const fileSafe = sanitizeFilePart(`u${i}_v${j}_${renderedTitle}`);
        previewPath = path.join(opts._generatedPreviewDir, `${fileSafe}.jpg`);
        await createTestPreview(previewPath, renderedTitle);
      }
      const data = await uploadVideo(opts.api, jar, filePath, previewPath, context, opts, videoCase);
      uploadsTotal += 1;
      console.log(
        `[seed] uploaded u=${i} v=${j} case=${videoCase.key} preview=yes desc=${videoCase.withDescription ? "yes" : "no"} tags=${videoCase.withTags ? "yes" : "no"} id=${data?.video_id ?? "unknown"}`
      );
    }
  }

  console.log(`[seed] done: users=${opts.users}, uploaded=${uploadsTotal}`);
  console.log("[seed] note: transcoding is async; wait for workers to finish processing.");
}

main().catch((err) => {
  console.error("[seed] error:", err?.message || err);
  process.exit(1);
});
