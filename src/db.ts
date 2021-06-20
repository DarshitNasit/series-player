import mongoose = require("mongoose");

exports = module.exports = async () => {
	mongoose
		.connect("mongodb://localhost:27017/series-player", {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		})
		.then((connection: { connection: { host: any } }) =>
			console.log(`MongoDB connected: ${connection.connection.host}`)
		);
};
