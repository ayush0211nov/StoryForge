import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
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
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
}, {
    timestamps: true,
});

commentSchema.index({ story: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
