const mongoose = require('mongoose');

const BotSessionSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
    unique: true, // e.g. "telegram:1234567" or "whatsapp:+1234567890"
  },
  platform: {
    type: String,
    enum: ['telegram', 'whatsapp'],
    required: true,
  },
  state: {
    type: String,
    enum: ['IDLE', 'AWAITING_DESCRIPTION', 'AWAITING_LOCATION', 'AWAITING_IMAGE', 'READY_TO_SUBMIT'],
    default: 'IDLE',
  },
  extracted_data: {
    category: { type: String, default: null },
    description: { type: String, default: null },
    priority: { type: String, default: 'medium' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    image_url: { type: String, default: null },
    address: { type: String, default: null }
  },
  last_interaction: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete sessions after 24 hours of inactivity
  }
});

// Update the last_interaction timestamp on every save
BotSessionSchema.pre('save', function (next) {
  this.last_interaction = Date.now();
  next();
});

module.exports = mongoose.model('BotSession', BotSessionSchema);
