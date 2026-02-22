import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const VIDEO_ID = __ENV.VIDEO_ID || "8f1f650a-4eea-4b52-b7b7-4a3de7ec6863";
const USER_ID = __ENV.USER_ID || "1087ea1c-4cb1-490d-b4e1-43d9d22758de";
const CHANNEL_ID = __ENV.CHANNEL_ID || USER_ID;
const HAS_AUTH = Boolean(
  __ENV.AUTH_COOKIE || (__ENV.AUTH_EMAIL && __ENV.AUTH_PASSWORD)
);

function createScenarios() {
  const base = {
    browse_feed: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_BROWSE || 20),
      duration: __ENV.DURATION || "2m",
      exec: "browseFeed",
      gracefulStop: "30s",
    },
    watch_page: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_WATCH || 15),
      duration: __ENV.DURATION || "2m",
      exec: "watchPage",
      gracefulStop: "30s",
    },
    channel_page: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_CHANNEL || 8),
      duration: __ENV.DURATION || "2m",
      exec: "channelPage",
      gracefulStop: "30s",
    },
    error_paths: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_ERRORS || 4),
      duration: __ENV.DURATION || "2m",
      exec: "errorPaths",
      gracefulStop: "30s",
    },
  };

  if (HAS_AUTH) {
    base.auth_read = {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_AUTH_READ || 6),
      duration: __ENV.DURATION || "2m",
      exec: "authRead",
      gracefulStop: "30s",
    };
    base.write_actions = {
      executor: "constant-vus",
      vus: Number(__ENV.VUS_WRITE || 4),
      duration: __ENV.DURATION || "2m",
      exec: "writeActions",
      gracefulStop: "30s",
    };
  }

  return base;
}

export const options = {
  scenarios: createScenarios(),
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<500"],
    "http_req_duration{endpoint:browse_feed}": ["p(95)<400"],
    "http_req_duration{endpoint:watch_video_get}": ["p(95)<400"],
    "http_req_duration{endpoint:watch_comments_get}": ["p(95)<400"],
    "http_req_duration{endpoint:watch_views_post}": ["p(95)<1200"],
    "http_req_duration{endpoint:channel_page}": ["p(95)<400"],
    "http_req_duration{endpoint:error_paths}": ["p(95)<400"],
    ...(HAS_AUTH
      ? {
          "http_req_duration{endpoint:auth_read}": ["p(95)<450"],
          "http_req_duration{endpoint:write_actions}": ["p(95)<500"],
        }
      : {}),
  },
};

function makeUUID(vu, iter) {
  const a = (vu + 0x100000000).toString(16).slice(-8);
  const b = (iter + 0x10000).toString(16).slice(-4);
  const c = ((vu * 31 + iter) + 0x10000).toString(16).slice(-4);
  const d = ((iter * 17 + vu) + 0x10000).toString(16).slice(-4);
  const e = ((vu * 100000 + iter) + 0x1000000000000).toString(16).slice(-12);
  return `${a}-${b}-${c}-${d}-${e}`;
}

function parseAuthorizationCookie(rawSetCookie) {
  if (!rawSetCookie) return null;
  const values = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
  const auth = values.find((v) => String(v).startsWith("Authorization="));
  if (!auth) return null;
  return String(auth).split(";")[0];
}

function request(method, url, body, params, expectedStatuses) {
  const responseCallback = http.expectedStatuses(...expectedStatuses);
  const reqParams = { ...(params || {}), responseCallback };
  const res = http.request(method, url, body, reqParams);
  check(res, {
    [`${method} ${url} status in [${expectedStatuses.join(",")}]`]: (r) =>
      expectedStatuses.includes(r.status),
  });
  return res;
}

export function setup() {
  if (__ENV.AUTH_COOKIE) {
    const cookie = __ENV.AUTH_COOKIE.includes("=")
      ? __ENV.AUTH_COOKIE
      : `Authorization=${__ENV.AUTH_COOKIE}`;
    return { authCookie: cookie };
  }

  if (!HAS_AUTH) {
    return { authCookie: null };
  }

  const payload = JSON.stringify({
    email: __ENV.AUTH_EMAIL,
    password: __ENV.AUTH_PASSWORD,
  });

  const loginRes = request(
    "POST",
    `${BASE_URL}/api/login`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "auth_setup" },
    },
    [200]
  );

  const authCookie = parseAuthorizationCookie(loginRes.headers["Set-Cookie"]);
  check(loginRes, {
    "setup has auth cookie": () => Boolean(authCookie),
  });

  return { authCookie };
}

export function browseFeed() {
  request(
    "GET",
    `${BASE_URL}/api/video?limit=20&offset=0`,
    null,
    { tags: { endpoint: "browse_feed" } },
    [200]
  );
  request(
    "GET",
    `${BASE_URL}/api/search?q=test&limit=20&offset=0`,
    null,
    { tags: { endpoint: "browse_feed" } },
    [200]
  );
  sleep(0.05);
}

export function watchPage() {
  request(
    "GET",
    `${BASE_URL}/api/video/${VIDEO_ID}`,
    null,
    { tags: { endpoint: "watch_video_get" } },
    [200]
  );
  request(
    "GET",
    `${BASE_URL}/api/video/${VIDEO_ID}/comments`,
    null,
    { tags: { endpoint: "watch_comments_get" } },
    [200]
  );
  const deviceID = makeUUID(__VU, __ITER);
  request(
    "POST",
    `${BASE_URL}/api/video/${VIDEO_ID}/views`,
    JSON.stringify({ device_id: deviceID, watched_seconds: 35 }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "watch_views_post" },
    },
    [200]
  );
  sleep(0.05);
}

export function channelPage() {
  request(
    "GET",
    `${BASE_URL}/api/user/${USER_ID}`,
    null,
    { tags: { endpoint: "channel_page" } },
    [200]
  );
  request(
    "GET",
    `${BASE_URL}/api/user/video/${VIDEO_ID}`,
    null,
    { tags: { endpoint: "channel_page" } },
    [200]
  );
  sleep(0.05);
}

export function authRead(data) {
  const cookie = data?.authCookie;
  if (!cookie) {
    sleep(0.1);
    return;
  }

  const params = { headers: { Cookie: cookie }, tags: { endpoint: "auth_read" } };
  request("GET", `${BASE_URL}/api/me`, null, params, [200]);
  request(
    "GET",
    `${BASE_URL}/api/channel/${CHANNEL_ID}/subcount?period=30`,
    null,
    params,
    [200]
  );
  request("GET", `${BASE_URL}/api/channel/${CHANNEL_ID}/subscribed`, null, params, [200]);
  sleep(0.05);
}

export function writeActions(data) {
  const cookie = data?.authCookie;
  if (!cookie) {
    sleep(0.1);
    return;
  }

  const params = {
    headers: { "Content-Type": "application/json", Cookie: cookie },
    tags: { endpoint: "write_actions" },
  };

  request(
    "POST",
    `${BASE_URL}/api/video/${VIDEO_ID}/comment`,
    JSON.stringify({ comment: `k6 comment vu=${__VU} iter=${__ITER}` }),
    params,
    [200]
  );

  const reaction = __ITER % 2 === 0 ? "like" : "dislike";
  request(
    "POST",
    `${BASE_URL}/api/video/${VIDEO_ID}/reaction?r=${reaction}`,
    null,
    { headers: { Cookie: cookie }, tags: { endpoint: "write_actions" } },
    [200]
  );

  request(
    "POST",
    `${BASE_URL}/api/user/channel/${CHANNEL_ID}?action=sub`,
    null,
    { headers: { Cookie: cookie }, tags: { endpoint: "write_actions" } },
    [200, 400]
  );

  sleep(0.1);
}

export function errorPaths() {
  request(
    "GET",
    `${BASE_URL}/api/video/not-a-uuid`,
    null,
    { tags: { endpoint: "error_paths" } },
    [400]
  );
  request(
    "POST",
    `${BASE_URL}/api/video/${VIDEO_ID}/reaction?r=invalid`,
    null,
    { tags: { endpoint: "error_paths" } },
    [401]
  );
  request(
    "POST",
    `${BASE_URL}/api/video/${VIDEO_ID}/views`,
    JSON.stringify({ device_id: "bad-uuid", watched_seconds: 5 }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "error_paths" },
    },
    [400]
  );
  sleep(0.05);
}
