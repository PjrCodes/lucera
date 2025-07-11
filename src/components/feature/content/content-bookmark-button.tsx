"use client";

import { useState, useEffect } from "react";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Bookmark } from "lucide-react";

interface ContentBookmarkButtonProps {
  contentId: string;
}

export default function ContentBookmarkButton({
  contentId,
}: ContentBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Track when component has mounted to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    setIsLoading(true);

    async function checkBookmarkStatus() {
      try {
        const response = await fetch(`/api/bookmarks/check?type=content&relatedId=${contentId}`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkBookmarkStatus();
  }, [contentId]);

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!hasMounted) {
    return (
      <SecondaryButton variant="outline" size="sm" disabled>
        <Bookmark className="h-4 w-4" />
      </SecondaryButton>
    );
  }

  const handleBookmarkToggle = async () => {
    setIsTogglingBookmark(true);
    try {
      const response = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "content",
          relatedId: contentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } else {
        console.error("Failed to toggle bookmark");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  if (isLoading) {
    return (
      <SecondaryButton variant="outline" size="sm" disabled>
        <Bookmark className="h-4 w-4" />
      </SecondaryButton>
    );
  }

  return (
    <SecondaryButton
      variant="outline"
      size="sm"
      onClick={handleBookmarkToggle}
      disabled={isTogglingBookmark}
    >
      <Bookmark
        className={`h-4 w-4 ${
          isBookmarked ? "fill-secondary-700 text-secondary-700" : ""
        }`}
      />
    </SecondaryButton>
  );
}
