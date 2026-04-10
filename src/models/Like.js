import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

likeSchema.index({ story: 1, user: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model('Like', likeSchema);
