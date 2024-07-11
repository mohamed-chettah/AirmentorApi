import { Hono } from "hono";

import { Types, isValidObjectId } from "mongoose";
import { Review } from "../models/review";
import { User } from "../models/user";

const reviews = new Hono().basePath("/reviews");

reviews.get("/", async (c) => {
  const review = await Review.find({}).populate("reviewer reviewed");
  return c.json(review);
});

reviews.get("/:id", async (c) => {
  const _id = c.req.param("id");

  if (isValidObjectId(_id)) {
    const review = await Review.findOne({ _id });
    return c.json(review);
  }
  return c.json({ msg: "ObjectId malformed" }, 400);
});

reviews.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const newReview = new Review(body);
    const saveReview = await newReview.save();

    // Find the user and update the reviews array
    const user = await User.findById(body.reviewed);

    if (user) {
      user.reviews.push(saveReview._id);
      await user.save();
    }

    return c.json(saveReview, 201);
  } catch (error: unknown) {
    // @ts-ignore
    return c.json(error._message, 400);
  }
});

// en put, on écrase toutes les valeurs (y compris les tableaux)
reviews.put("/:id", async (c) => {
  const _id = c.req.param("id");
  const body = await c.req.json();
  // on attrape l'id de la creations (_id)
  // on a besoin du body pour les champs à mettre à jour
  // on peut préparer notre query pour findOneAndUpdate
  const q = {
    _id,
  };
  const updateQuery = {
    ...body,
  };
  // par défaut il va faire un $set

  const tryToUpdate = await Review.findOneAndUpdate(q, updateQuery, { new: true });
  return c.json(tryToUpdate, 200);
});
// en patch, on va "append" les éléments passés dans le body
reviews.patch("/:id", async (c) => {
  const _id = c.req.param("id");
  const body = await c.req.json();
  // on attrape l'id de la creations (_id)
  // on a besoin du body pour les champs à mettre à jour
  // on peut préparer notre query pour findOneAndUpdate
  const q = {
    _id,
  };
  const { grade, description, reviewer, reviewed } = body;

  const updateQuery = {
    $set: {
      ...(grade !== undefined && { grade }),
      ...(description !== undefined && { description }),
      ...(reviewer !== undefined && { reviewer: new Types.ObjectId(reviewer) }),
      ...(reviewed !== undefined && { reviewed: new Types.ObjectId(reviewed) }),
    },
  };

  const tryToUpdate = await Review.findOneAndUpdate(q, updateQuery, { new: true });
  return c.json(tryToUpdate, 200);
});

reviews.delete("/:id", async (c) => {
  const _id = c.req.param("id");
  const tryToDelete = await Review.deleteOne({ _id });
  const { deletedCount } = tryToDelete;
  if (deletedCount) {
    return c.json({ msg: "DELETE done" });
  }
  return c.json({ msg: "not found" }, 404);
});

export default reviews;
