import express from "express";
import Review from "../../models/Review.js";
import protectRoute from "../../middlewares/auth/auth.middleware.js";
import searchQuery from "../../utils/search/query.js";
import cloudinary from "../../lib/upload/cloudinary.js";
import { deleteImageFromCloudinary } from "../../utils/upload/delete-image-cloudinary.js";

const router = express.Router();

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const bookTitle = req.query.bookTitle;

    const reviews = await Review.find(
      bookTitle && {
        bookTitle: {
          $regex: searchQuery(bookTitle),
          $options: "i",
        },
      }, // "i" ignora maiúsculas e minúsculas
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    if (reviews.length === 0) {
      return res
        .status(200)
        .json({ message: "None or no more reviews to see :)" });
    }

    const totalReviews = await Review.countDocuments();

    res.send({
      reviews,
      currentPage: page,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    });
  } catch (error) {
    console.log("Error when fetching the reviews.", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, bookTitle, rating, image, caption } = req.body;

    if (!title || !bookTitle || !rating || !image || !caption) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "voci-letterarie/reviews",
      unique_filename: true,
    });

    const imageUrl = uploadResponse.secure_url;

    const newReview = await Review.create({
      title,
      bookTitle,
      rating,
      image: imageUrl,
      caption,
      user: req.user._id,
    });

    if (!newReview) {
      console.log(
        "Error in review creation route, when trying to create a new review.",
      );
      return res.status(500).json({ message: "Internal server error." });
    }

    await newReview.save();

    return res.status(201).json(newReview);
  } catch (error) {
    console.log("Error in review creation route.", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.patch("/:id", protectRoute, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(400).json({ message: "Review not found." });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not authorized, access denied.",
      });
    }

    const { title, bookTitle, rating, image, caption } = req.body;

    if (image) {
      const oldImage = review.image;
      const result = await deleteImageFromCloudinary(oldImage);

      if (result.value === false) {
        return res.status(400).json({ message: result.message });
      }

      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "voci-letterarie/reviews",
        unique_filename: true,
      });

      const imageUrl = uploadResponse.secure_url;

      await review.updateOne({
        title: title,
        bookTitle: bookTitle,
        rating: rating,
        image: imageUrl,
        caption: caption,
      });

      return res.status(201).json({ message: "Review updated successfully." });
    }

    await review.updateOne({
      title: title,
      bookTitle: bookTitle,
      rating: rating,
      caption: caption,
    });

    return res.status(201).json({ message: "Review updated successfully." });
  } catch (error) {
    console.log("Error when uptading a review: ", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(400).json({ message: "Review not found." });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not authorized, access denied.",
      });
    }

    if (review.image && review.image.includes("cloudinary")) {
      const result = await deleteImageFromCloudinary(review.image);

      if (result.value === false) {
        return res.status(400).json({ message: result.message });
      }

      await review.deleteOne();

      return res.status(200).json({
        message: `Review - '${review.title}', by ${req.user.username} was deleted successfully`,
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      message: `Review - '${review.title}', by ${req.user.username} was deleted successfully`,
    });
  } catch (error) {
    console.log("Error when deleting a review: ", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
