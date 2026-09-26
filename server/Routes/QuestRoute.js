const router = require("express").Router();

const {
  listQuests,
  listMyQuests,
  createQuest,
  getQuest,
  joinQuest,
  leaveQuest,
} = require("../Controllers/QuestController");
const { verifyToken } = require("../Middlewares/AuthMiddleware");

// "/quests/mine" must be declared before "/quests/:id".
router.get("/quests/mine", verifyToken, listMyQuests);
router.get("/quests", verifyToken, listQuests);
router.post("/quests", verifyToken, createQuest);
router.get("/quests/:id", verifyToken, getQuest);
router.post("/quests/:id/join", verifyToken, joinQuest);
router.post("/quests/:id/leave", verifyToken, leaveQuest);

module.exports = router;