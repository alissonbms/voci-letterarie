import express from "express";
import Review from "../../models/Review.js";
import protectRoute from "../../middlewares/auth/auth.middleware.js";
import searchQuery from "../../utils/search/query.js";

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

export default router;
