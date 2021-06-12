const fs = require("fs");
const alphanum = require("./Alphanum");
const { spawn } = require("child_process");
const Episode = require("./episode");
require("./db")();

const vlc_path = "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe";
const argv = process.argv;
let index = 2;

let name, new_name, path, current_season, current_episode;
let accepted_mime_types = [".mp4", ".mov", ".wmv", ".mkv"];

async function main() {
	while (index < argv.length) {
		switch (argv[index]) {
			case "--path": {
				path = argv[++index];
				break;
			}

			case "--name": {
				new_name = argv[++index];
				break;
			}

			case "--season": {
				current_season = argv[++index];
				break;
			}

			case "--episode": {
				current_episode = argv[++index];
				break;
			}

			default: {
				name = argv[index];
			}
		}
		index++;
	}

	let episode = await Episode.findOne({ name });
	if (!episode) {
		if (!path) {
			console.log(`Episode not found with name : ${name}`);
			process.exit(0);
		}
		episode = new Episode({ name, path });
		await episode.save();
	} else {
		if (path) episode.path = path;
		if (new_name) episode.name = new_name;
		if (current_season) episode.current_season = current_season;
		if (current_episode) episode.current_episode = current_episode;
		await episode.save();
	}

	path = episode.path;
	current_season = episode.current_season;
	current_episode = episode.current_episode;

	do {
		let seasons = fs.readdirSync(path);
		seasons = seasons
			.filter((season) => fs.lstatSync(path + "\\" + season).isDirectory())
			.sort(alphanum);

		if (current_season > seasons.length) break;

		let season_path = path + "\\" + seasons[current_season - 1];
		let episodes = fs.readdirSync(season_path);
		episodes = episodes
			.filter((episode) => {
				try {
					let accepted_mime = false;
					accepted_mime_types.forEach(
						(mime) => (accepted_mime |= episode.endsWith(mime))
					);

					let accepted = true;
					accepted &= fs.lstatSync(season_path + "\\" + episode).isFile();
					accepted &= accepted_mime;
					return accepted;
				} catch (error) {
					return false;
				}
			})
			.sort(alphanum);

		let video = spawn(vlc_path, [season_path + "\\" + episodes[current_episode - 1]]);
		let promise = new Promise(async (resolve) => {
			video.on("close", async () => {
				if (current_episode === episodes.length) {
					current_season++;
					current_episode = 1;
				} else {
					current_episode++;
				}

				episode.current_season = current_season;
				episode.current_episode = current_episode;
				await episode.save();

				resolve();
			});
		});
		await promise;
	} while (true);
}

main();
