import { Hono } from "hono";

import { User } from "../models/user";

const users = new Hono().basePath("/users");

users.get("/", async (c) => {
  const user = await User.find({});
  return c.json(user);
});

users.get("/:googleId", async (c) => {
  const googleId = c.req.param("googleId");
  const user = await User.findOne({ googleId });
  return c.json(user);
});

users.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const newUser = new User(body);
    const saveUser = await newUser.save();
    return c.json(saveUser, 201);
  } catch (error: unknown) {
    // @ts-ignore
    return c.json(error._message, 400);
  }
});

// en put, on écrase toutes les valeurs (y compris les tableaux)
users.put("/:googleId", async (c) => {
  const googleId = c.req.param("googleId");
  const body = await c.req.json();
  // on attrape l'id de la creations (_id)
  // on a besoin du body pour les champs à mettre à jour
  // on peut préparer notre query pour findOneAndUpdate
  const q = {
    googleId,
  };
  const updateQuery = {
    ...body,
  };
  // par défaut il va faire un $set

  const tryToUpdate = await User.findOneAndUpdate(q, updateQuery, { new: true });
  return c.json(tryToUpdate, 200);
});
// en patch, on va "append" les éléments passés dans le body
users.patch("/:id", async (c) => {
  const _id = c.req.param("id");
  const body = await c.req.json();
  // on attrape l'id de la creations (_id)
  // on a besoin du body pour les champs à mettre à jour
  // on peut préparer notre query pour findOneAndUpdate
  const q = {
    _id,
  };
  const { name, email, phoneNumber, place, password, profile_picture, grade, credits, description, languages } = body;

  const updateQuery = {
    $set: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(place !== undefined && { place }),
      ...(password !== undefined && { password }),
      ...(profile_picture !== undefined && { profile_picture }),
      ...(grade !== undefined && { grade }),
      ...(credits !== undefined && { credits }),
      ...(description !== undefined && { description }),
      ...(languages !== undefined && { languages }),
    },
  };
  const tryToUpdate = await User.findOneAndUpdate(q, updateQuery, { new: true });
  return c.json(tryToUpdate, 200);
});

users.delete("/:id", async (c) => {
  const _id = c.req.param("id");
  const tryToDelete = await User.deleteOne({ _id });
  const { deletedCount } = tryToDelete;
  if (deletedCount) {
    return c.json({ msg: "DELETE done" });
  }
  return c.json({ msg: "not found" }, 404);
});

export default users;
