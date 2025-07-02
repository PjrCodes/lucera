import Link from "next/link";
import Image from "next/image";
import React from "react";

interface ProfileCircleProps {
  imageUrl?: string | null;
  size?: number;
  alt?: string;
}

const ProfileCircle: React.FC<ProfileCircleProps> = ({
  imageUrl,
  size = 40,
  alt = "Profile Image",
}) => {
  const sizeStyle = { width: size, height: size };
  const fontSize = size / 2;

  return (
    <div
      className="rounded-full overflow-hidden bg-secondary-100 flex items-center justify-center cursor-pointer"
      style={sizeStyle}
    >
      <Link
        href="/profile"
        className="flex items-center justify-center w-full h-full"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={size}
            height={size}
            className="object-cover rounded-full w-full h-full"
          />
        ) : (
          <span className="text-secondary-600 font-bold" style={{ fontSize }}>
            ?
          </span>
        )}
      </Link>
    </div>
  );
};

export default ProfileCircle;
