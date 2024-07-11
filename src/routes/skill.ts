import { Hono } from "hono";

import { isValidObjectId } from "mongoose";
import { Skill } from "../models/skill";

const skills = new Hono().basePath("/skills");

skills.get("/", async (c) => {
  const skills = await Skill.find().populate("categories");
  return c.json(skills);
});

skills.get("/:id", async (c) => {
  const _id = c.req.param("id");

  if (isValidObjectId(_id)) {
    const skill = await Skill.findOne({ _id });
    return c.json(skill);
  }
  return c.json({ msg: "ObjectId malformed" }, 400);
});

skills.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const newSkill = new Skill(body);
    const saveSkill = await newSkill.save();
    return c.json(saveSkill, 201);
  } catch (error: unknown) {
    // @ts-ignore
    return c.json(error._message, 400);
  }
});

// en put, on écrase toutes les valeurs (y compris les tableaux)
skills.put("/:id", async (c) => {
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
  const tryToUpdate = await Skill.updateOne({"_id": _id}, updateQuery, { new: true });

  return c.json(tryToUpdate, 200);
});
// en patch, on va "append" les éléments passés dans le body
skills.patch("/:id", async (c) => {
  const _id = c.req.param("id");
  const body = await c.req.json();
  // on attrape l'id de la creations (_id)
  // on a besoin du body pour les champs à mettre à jour
  // on peut préparer notre query pour findOneAndUpdate
  const q = {
    _id,
  };
  const { title, categories } = body;

  const updateQuery = {
    $set: {
      ...(title !== undefined && { title }),
      ...(categories !== undefined && { categories }),
    },
  };
  const tryToUpdate = await Skill.findOneAndUpdate(q, updateQuery, { new: true });
  return c.json(tryToUpdate, 200);
});

skills.delete("/:id", async (c) => {
  const _id = c.req.param("id");
  const tryToDelete = await Skill.deleteOne({ _id });
  const { deletedCount } = tryToDelete;
  if (deletedCount) {
    return c.json({ msg: "DELETE done" });
  }
  return c.json({ msg: "not found" }, 404);
});

export default skills;
