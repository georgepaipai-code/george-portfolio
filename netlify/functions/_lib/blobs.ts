import { getStore } from "@netlify/blobs";

export function getEventsStore() {
  return getStore("events");
}

export function getLoginAttemptsStore() {
  return getStore("login-attempts");
}
