const mongoose = require("mongoose");

const Quest = require("../Models/QuestModel");

const { QUEST_STATUSES } = Quest;

const parseQuestInput = (body) => {
  const source = body || {};
  return {
    title: typeof source.title === "string" ? source.title.trim() : "",
    description:
      typeof source.description === "string" ? source.description.trim() : "",
    category: typeof source.category === "string" ? source.category.trim() : "",
    location: typeof source.location === "string" ? source.location.trim() : "",
    status:
      typeof source.status === "string" && QUEST_STATUSES.includes(source.status)
        ? source.status
        : "open",
  };
};

const populateQuest = (query) =>
  query
    .populate("creator", "username email")
    .populate("participants", "username email");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Quest not found" });

/** GET /quests - every quest in the database, newest first. */
module.exports.listQuests = async (req, res, next) => {
  try {
    const quests = await populateQuest(Quest.find({}).sort({ createdAt: -1 }));
    return res.json({ success: true, data: quests });
  } catch (error) {
    return next(error);
  }
};

/** GET /quests/mine - quests this user created or joined. */
module.exports.listMyQuests = async (req, res, next) => {
  try {
    const quests = await populateQuest(
      Quest.find({
        $or: [{ creator: req.userId }, { participants: req.userId }],
      }).sort({ createdAt: -1 })
    );
    return res.json({ success: true, data: quests });
  } catch (error) {
    return next(error);
  }
};

/** POST /quests - create a quest owned by the signed-in user. */
module.exports.createQuest = async (req, res, next) => {
  try {
    const input = parseQuestInput(req.body);
    if (!input.title || !input.description || !input.category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    const quest = await Quest.create({ ...input, creator: req.userId });
    return res
      .status(201)
      .json({ success: true, message: "Quest created successfully", data: quest });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res
        .status(400)
        .json({ success: false, message: Object.values(error.errors)[0].message });
    }
    return next(error);
  }
};

/** GET /quests/:id */
module.exports.getQuest = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);

    const quest = await populateQuest(Quest.findById(req.params.id));
    if (!quest) return notFound(res);

    return res.json({ success: true, data: quest });
  } catch (error) {
    return next(error);
  }
};

/** POST /quests/:id/join */
module.exports.joinQuest = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);

    const quest = await Quest.findById(req.params.id);
    if (!quest) return notFound(res);

    const alreadyJoined = quest.participants.some(
      (participantId) => participantId.toString() === String(req.userId)
    );
    if (alreadyJoined) {
      return res.json({
        success: true,
        message: "You have already joined this quest",
        data: quest,
      });
    }

    quest.participants.push(req.userId);
    await quest.save();

    return res.json({ success: true, message: "Joined the quest", data: quest });
  } catch (error) {
    return next(error);
  }
};

/** POST /quests/:id/leave */
module.exports.leaveQuest = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res);

    const quest = await Quest.findById(req.params.id);
    if (!quest) return notFound(res);

    quest.participants = quest.participants.filter(
      (participantId) => participantId.toString() !== String(req.userId)
    );
    await quest.save();

    return res.json({ success: true, message: "Left the quest", data: quest });
  } catch (error) {
    return next(error);
  }
};