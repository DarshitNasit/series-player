import fs = require("fs");
import path = require("path");
import alphanum from "./Alphanum";
import { spawn } from "child_process";
import Episode, { EpisodeDoc } from "./episode";
import readline = require("readline-sync");
require("./db")();

const vlc_path: string = "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe";
const all_root_folders = ["E:\\Series", "F:\\Movies\\Hollywood"];
const argv = process.argv;

let series_name: string,
	series_path: string,
	current_season: number,
	current_episode: number,
	episode: EpisodeDoc,
	series_root_folder: string;
const accepted_mime_types = [".mp4", ".mov", ".wmv", ".mkv", ".avi", ".asf", ".wma", ".wav"];

async function main() {
	await get_env_variables();
	await get_from_db_if_available();
	await find_absolute_path();
	await get_episode();
	await play_series();
}

async function get_env_variables() {
	let index = 2;
	while (index < argv.length) {
		switch (argv[index]) {
			case "--path": {
				series_path = argv[++index];
				break;
			}

			case "--season": {
				current_season = parseInt(argv[++index]);
				break;
			}

			case "--episode": {
				current_episode = parseInt(argv[++index]);
				break;
			}

			default: {
				series_name = argv[index].toLowerCase();
			}
		}
		index++;
	}
}

async function get_from_db_if_available() {
	episode = await Episode.findOne({ name: series_name });
	if (episode) return (series_path = episode.path);

	const index = readline.keyInSelect(all_root_folders, "Which folder?");
	series_root_folder = all_root_folders[index];
}

async function find_absolute_path() {
	if (series_path) return;

	if (!series_name) {
		console.error("Error: Enter valid series name");
		process.exit(0);
	}
	if (current_season && current_season <= 0) {
		console.error("Error: Enter valid season number");
		process.exit(0);
	}
	if (current_episode && current_episode <= 0) {
		console.error("Error: Enter valid episode number");
		process.exit(0);
	}

	const all_series = fs.readdirSync(series_root_folder).filter((series: string) => {
		try {
			return fs.lstatSync(path.join(series_root_folder, series)).isDirectory();
		} catch (error) {
			return false;
		}
	});

	const scores = {};
	const series_name_keywords = series_name.split(" ");

	all_series.map((series: string) => {
		let matched_keywords = 0;
		const keywords = series.split(" ").map((word: string) => word.toLowerCase());
		keywords.forEach((keyword: string) => {
			if (series_name_keywords.includes(keyword)) matched_keywords++;
		});
		scores[series] = matched_keywords / keywords.length;
	});

	let max_score = 0,
		max_score_series: string;

	Object.keys(scores).forEach((field: string) => {
		if (max_score < scores[field]) {
			max_score = scores[field];
			max_score_series = field;
		}
	});

	if (max_score === 0) {
		console.error("Error: Series not found");
		process.exit(0);
	}
	series_path = path.join(series_root_folder, max_score_series);
}

async function get_episode() {
	if (!episode) {
		series_name = path.basename(series_path).toLowerCase();
		if (!series_name) process.exit(1);

		episode = await Episode.findOne({ name: series_name });
		if (!episode) {
			episode = Episode.build({
				name: series_name.toLowerCase(),
				path: path.resolve(series_path),
			});
		}
	}

	if (current_season) episode.current_season = current_season;
	if (current_episode) episode.current_episode = current_episode;
}

async function play_series() {
	let seasons: string[];
	try {
		seasons = fs.readdirSync(series_path);
	} catch (error) {
		console.error("Error: Path does not exists");
		process.exit(0);
	}
	seasons = seasons
		.filter((season: string) => {
			try {
				return (
					fs.lstatSync(path.join(series_path, season)).isDirectory() &&
					!season.startsWith(".")
				);
			} catch (error) {
				return false;
			}
		})
		.sort(alphanum);

	episode.current_season = Math.min(episode.current_season, Math.max(seasons.length, 1) + 1);
	await episode.save();

	if (seasons.length > 0) play_season_wise(seasons);
	else {
		episode.current_season = 1;
		play_sequentially(series_path);
	}
}

async function play_season_wise(seasons: string[]) {
	while (episode.current_season <= seasons.length) {
		const season_path: string = path.join(series_path, seasons[episode.current_season - 1]);
		await play_sequentially(season_path);
	}

	if (episode.current_episode !== 1 || episode.current_season !== seasons.length + 1) {
		episode.current_season = seasons.length + 1;
		episode.current_episode = 1;
		await episode.save();
	}

	console.log("Series ended");
	process.exit(0);
}

async function play_sequentially(season_path: string) {
	const episodes: string[] = fs
		.readdirSync(season_path)
		.filter((episode: string) => {
			try {
				let accepted_mime = false;
				accepted_mime_types.forEach(
					(mime: string) => (accepted_mime = accepted_mime || episode.endsWith(mime))
				);

				const is_file = fs.lstatSync(path.join(season_path, episode)).isFile();
				return is_file && accepted_mime;
			} catch (error) {
				return false;
			}
		})
		.sort(alphanum);

	while (episode.current_episode <= episodes.length) {
		console.log(`Season: ${episode.current_season}, Episode: ${episode.current_episode}`);
		const video_path: string = path.join(season_path, episodes[episode.current_episode - 1]);
		await play_video(video_path, async () => {
			episode.current_episode++;
			await episode.save();
		});
	}
	episode.current_season++;
	episode.current_episode = 1;
	await episode.save();
}

async function play_video(video_path: string, on_video_end_cb: () => Promise<void>) {
	const video = spawn(vlc_path, [video_path]);
	await new Promise<void>(async (resolve: () => void) => {
		video.on("close", async () => {
			await on_video_end_cb();
			resolve();
		});
	});
}

main();
export {};
