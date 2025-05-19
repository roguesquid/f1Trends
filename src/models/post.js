import mongoose from 'mongoose';

const tweetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: String,
  edit_history_tweet_ids: [String],
});

const Tweet = mongoose.model('Tweet', tweetSchema);
export default Tweet;