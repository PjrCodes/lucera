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
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Link href="/profile">
        {imageUrl ? (
          <Image src={imageUrl} alt={alt} width={96} height={96} />
        ) : (
          <span
            style={{
              color: "#888",
              fontSize: size / 2,
              fontWeight: "bold",
            }}
          >
            ?
          </span>
        )}
      </Link>
    </div>
  );
};

export default ProfileCircle;
