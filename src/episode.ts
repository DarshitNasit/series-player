import * as mongoose from "mongoose";

interface IEpisode {
	name: string;
	path: string;
	current_season?: number;
	current_episode?: number;
}

export interface EpisodeDoc extends mongoose.Document {
	name: string;
	path: string;
	current_season: number;
	current_episode: number;
}

interface EpisodeModelInterface extends mongoose.Model<EpisodeDoc> {
	build(episode: IEpisode): EpisodeDoc;
}

const EpisodeSchema = new mongoose.Schema(
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
			default: 1,
		},
		current_episode: {
			type: Number,
			default: 1,
		},
	},
	{ versionKey: false }
);

EpisodeSchema.statics.build = (episode: IEpisode) => {
	return new EpisodeModel(episode);
};

const EpisodeModel = mongoose.model<EpisodeDoc, EpisodeModelInterface>(
	"Episode",
	EpisodeSchema,
	"Episode"
);
EpisodeModel.ensureIndexes();

export default EpisodeModel;
