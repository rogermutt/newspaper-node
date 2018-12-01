const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: String,
    type: String,
    timestamp: String,
    content: String,
    comments: Array
});

module.exports = mongoose.model("articles", articleSchema);
