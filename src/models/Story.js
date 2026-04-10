import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Story title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        enum: [
            'Fantasy', 'Science Fiction', 'Romance', 'Mystery', 'Horror',
            'Adventure', 'Historical', 'Comedy', 'Drama', 'Thriller',
            'Children', 'Poetry', 'Non-Fiction', 'Fairy Tale',
        ],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'draft'],
        default: 'draft',
    },
    coverImage: {
        type: String,
        default: '',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    chaptersCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
}, {
    timestamps: true,
});

storySchema.index({ author: 1, visibility: 1 });
storySchema.index({ genre: 1, visibility: 1 });
storySchema.index({ likesCount: -1 });
storySchema.index({ createdAt: -1 });

export default mongoose.models.Story || mongoose.model('Story', storySchema);
