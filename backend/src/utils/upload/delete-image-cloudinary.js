import cloudinary from "../../lib/upload/cloudinary.js";

const extractPublicId = (oldImage) => {
  const parts = oldImage.split("/upload/");
  if (parts.length < 2) return null;

  let publicId = parts[1].split(".")[0];

  publicId = publicId.replace(/v\d+\//, "");

  return publicId;
};

export const deleteImageFromCloudinary = async (oldImage) => {
  try {
    const publicId = extractPublicId(oldImage);
    if (!publicId) throw new Error("Invalid URL");

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { message: "Image deleted successfully!", value: true };
    }

    if (result.result === "not found") {
      return {
        message: "Image not found on Cloudinary, ensure your url is correct.",
        value: false,
      };
    }
  } catch (error) {
    console.error("Error when deleting the image: ", error);
    return {
      message: "Unknown error while deleting image, please try again later.",
      value: false,
    };
  }
};
