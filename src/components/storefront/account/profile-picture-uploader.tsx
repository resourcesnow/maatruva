"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cloudinaryFolders } from "@/lib/cloudinary-folders";
import { updateProfilePictureAction, removeProfilePictureAction } from "@/lib/actions/account";

export function ProfilePictureUploader({
  userId,
  name,
  image,
}: {
  userId: string;
  name: string;
  image?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  function handleSuccess(result: { event?: string; info?: unknown }) {
    if (result.event !== "success") return;
    const info = result.info;
    if (!info || typeof info === "string") return;
    const asset = info as { secure_url: string; public_id: string };

    startTransition(async () => {
      await updateProfilePictureAction(asset.secure_url, asset.public_id);
      toast.success("Profile picture updated.");
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeProfilePictureAction();
      toast.success("Profile picture removed.");
      router.refresh();
    });
  }

  return (
    <div className="group relative">
      <Avatar size="lg" className="size-16">
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="text-xl font-semibold">{initial}</AvatarFallback>
      </Avatar>

      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign"
        onSuccess={handleSuccess}
        options={{
          folder: cloudinaryFolders.profilePicture(userId),
          multiple: false,
          maxFiles: 1,
          sources: ["local", "camera"],
          clientAllowedFormats: ["image"],
          maxImageFileSize: 5 * 1024 * 1024,
          cropping: true,
          croppingAspectRatio: 1,
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={pending}
            aria-label="Change profile picture"
            className="border-background bg-maroon absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2 text-white"
          >
            <Camera className="size-3" />
          </button>
        )}
      </CldUploadWidget>

      {image && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          aria-label="Remove profile picture"
          className="border-background bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
