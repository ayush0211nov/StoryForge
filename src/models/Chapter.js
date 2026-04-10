import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
    },
    chapterNumber: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Chapter title is required'],
        trim: true,
        maxlength: [200, 'Chapter title cannot exceed 200 characters'],
    },
    content: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    imagePrompt: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

chapterSchema.index({ story: 1, chapterNumber: 1 });

export default mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);
