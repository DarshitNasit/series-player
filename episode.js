const mongoose = require("mongoose");

const EpisodeSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		path: {
			type: String,
			required: true,
		},
		current_season: {
			type: Number,
			required: true,
			default: 1,
		},
		current_episode: {
			type: Number,
			required: true,
			default: 1,
		},
	},
	{ versionKey: false }
);

const EpisodeModel = mongoose.model("Episode", EpisodeSchema, "Episode");
EpisodeModel.ensureIndexes();

module.exports = EpisodeModel;
