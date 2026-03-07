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
 *   --password Qwerty123! \
 *   --prefix seed_user
 *
 * If --dir / --preview-dir are omitted, files are generated via ffmpeg.
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
    i += 1;
  }
  return out;
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

async function createTestMP4(outPath) {
  // Mirrors backend/internal/testutil/CreateTestMP4.
  await execFileAsync("ffmpeg", [
    "-f", "lavfi",
    "-i", "color=c=black:s=480x360:d=1",
    "-f", "lavfi",
    "-i", "anullsrc",
    "-shortest",
    "-c:v", "libx264",
    "-c:a", "aac",
    outPath,
    "-y",
  ]);
}

async function createTestPreview(outPath) {
  await execFileAsync("ffmpeg", [
    "-f", "lavfi",
    "-i", "color=c=black:s=480x360",
    "-frames:v", "1",
    outPath,
    "-y",
  ]);
}

async function ensureGeneratedAssetsIfNeeded(opts) {
  let generatedRoot = "";
  const count = Math.max(1, Number(opts.videos) || 1);

  if (!opts.dir) {
    generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-"));
    const videosDir = path.join(generatedRoot, "videos");
    await fs.mkdir(videosDir, { recursive: true });

    for (let i = 1; i <= count; i += 1) {
      await createTestMP4(path.join(videosDir, `generated_${i}.mp4`));
    }
    opts.dir = videosDir;
  }

  if (!opts.previewDir) {
    if (!generatedRoot) {
      generatedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "videohosting-seed-"));
    }
    const previewsDir = path.join(generatedRoot, "previews");
    await fs.mkdir(previewsDir, { recursive: true });

    for (let i = 1; i <= count; i += 1) {
      await createTestPreview(path.join(previewsDir, `generated_${i}.jpg`));
    }
    opts.previewDir = previewsDir;
  }

  return generatedRoot;
}

function renderTemplate(template, context) {
  return String(template)
    .replaceAll("{u}", String(context.u))
    .replaceAll("{v}", String(context.v))
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

async function uploadVideo(apiBase, jar, filePath, previewPath, context, opts) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  const bytes = await fs.readFile(filePath);
  const blob = new Blob([bytes], { type: extToMime(ext) });

  const form = new FormData();
  form.append("video", blob, fileName);
  form.append("name", renderTemplate(opts.titleTemplate, context));
  form.append("description", renderTemplate(opts.descriptionTemplate, context));

  for (const tag of buildTags(opts.tags, context)) {
    form.append("tags[]", tag);
  }

  if (previewPath) {
    const previewName = path.basename(previewPath);
    const previewExt = path.extname(previewName);
    const previewBytes = await fs.readFile(previewPath);
    const previewBlob = new Blob([previewBytes], { type: imageExtToMime(previewExt) });
    form.append("preview", previewBlob, previewName);
  }

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
  if (generatedRoot) {
    console.log(`[seed] generatedAssetsDir=${generatedRoot}`);
  }

  let uploadsTotal = 0;
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

    if (avatarFiles.length > 0) {
      const avatarPath = avatarFiles[(i - 1) % avatarFiles.length];
      await uploadAvatar(opts.api, jar, userId, avatarPath);
      console.log(`[seed] avatar uploaded u=${i} file=${path.basename(avatarPath)}`);
    }

    for (let j = 1; j <= opts.videos; j += 1) {
      const filePath = videoFiles[(j - 1) % videoFiles.length];
      const previewPath = previewFiles.length > 0 ? previewFiles[(j - 1) % previewFiles.length] : "";
      const context = {
        u: i,
        v: j,
        file: path.basename(filePath, path.extname(filePath)),
        ext: path.extname(filePath).replace(".", ""),
      };
      const data = await uploadVideo(opts.api, jar, filePath, previewPath, context, opts);
      uploadsTotal += 1;
      console.log(`[seed] uploaded u=${i} v=${j} id=${data?.video_id ?? "unknown"}`);
    }
  }

  console.log(`[seed] done: users=${opts.users}, uploaded=${uploadsTotal}`);
  console.log("[seed] note: transcoding is async; wait for workers to finish processing.");
}

main().catch((err) => {
  console.error("[seed] error:", err?.message || err);
  process.exit(1);
});
