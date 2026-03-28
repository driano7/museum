const globalObj = typeof window !== "undefined" ? window : {};

if (typeof globalObj.global === "undefined") {
  globalObj.global = globalObj;
}

if (typeof globalObj.process === "undefined") {
  globalObj.process = { env: {} };
} else if (typeof globalObj.process.env === "undefined") {
  globalObj.process.env = {};
}
