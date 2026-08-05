// src/components/lesson/StoryHookMedia.jsx
import React, { useState } from "react";

/**
 * Helper to check if a URL is a video source (direct MP4/WebM, Firebase Storage video, or YouTube)
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  return (
    lower.includes(".mp4") ||
    lower.includes(".webm") ||
    lower.includes(".ogg") ||
    lower.includes(".mov") ||
    (lower.includes("firebasestorage") && (lower.includes("video") || lower.includes(".mp4") || lower.includes("alt=media"))) ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be")
  );
}

/**
 * Extracts YouTube Video ID if present
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * StoryHookMedia renders a video player if video_url / media_url / Firebase video link is provided,
 * or falls back to image visual / 3D illustration.
 */
export default function StoryHookMedia({
  content = {},
  storyVisual = "",
  fallbackSceneImg = "",
  className = "w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-500"
}) {
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawVideoUrl = content.video_url || content.media_url || content.video;
  const rawImageUrl = content.image_url || content.visual_url || content.visual?.image_url;

  // Determine if rawImageUrl itself is a video URL (e.g. Firebase Storage MP4 uploaded as image_url)
  const isImageFieldVideo = isVideoUrl(rawImageUrl);
  const activeVideoUrl = (!videoError && rawVideoUrl) ? rawVideoUrl : (isImageFieldVideo && !videoError ? rawImageUrl : null);

  const ytId = activeVideoUrl ? getYouTubeId(activeVideoUrl) : null;

  // Render YouTube embed if activeVideoUrl is a YouTube link
  if (activeVideoUrl && ytId) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&modestbranding=1`}
          title="Story Hook Video"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Render HTML5 Video player for Firebase Storage or MP4/WebM video
  if (activeVideoUrl && !ytId) {
    return (
      <div className="relative w-full h-full bg-stone-950 flex items-center justify-center overflow-hidden">
        <video
          src={activeVideoUrl}
          controls
          autoPlay
          loop
          muted
          playsInline
          poster={storyVisual || fallbackSceneImg}
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover object-center"
        >
          <source src={activeVideoUrl} type="video/mp4" />
          <source src={activeVideoUrl} type="video/webm" />
          Browser anda tidak menyokong elemen video.
        </video>
      </div>
    );
  }

  // Render Image Visual fallback
  const displayImage = (!imageError && storyVisual) ? storyVisual : fallbackSceneImg;

  return (
    <img
      src={displayImage}
      alt="Suku Penyu Mascot Story Visual"
      onError={() => setImageError(true)}
      className={className}
    />
  );
}
