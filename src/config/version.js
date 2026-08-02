/**
 * Application Version Configuration
 * Used to tag telemetry, bug reports, and logs during the Alpha Phase.
 */

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.1.0-alpha";
export const APP_ENV = import.meta.env.VITE_APP_ENV || "development";

export const getVersionString = () => {
  return `StudyQuest v${APP_VERSION} (${APP_ENV})`;
};
