import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import Like from '@/models/Like';
import Bookmark from '@/models/Bookmark';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const story = await Story.findById(id).populate('author', 'name avatar bio followersCount');
        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const authUser = await getAuthUser(request);

        if (story.visibility !== 'public') {
            if (!authUser) {
                return NextResponse.json({ error: 'Story not found' }, { status: 404 });
            }
            const storyAuthorId = story.author._id?.toString() || story.author?.toString();
            const userId = authUser.id || authUser._id;
            if (storyAuthorId !== userId && authUser.role !== 'admin') {
                return NextResponse.json({ error: 'Story not found' }, { status: 404 });
            }
        }

        // Increment views
        await Story.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

        const chapters = await Chapter.find({ story: id }).sort({ chapterNumber: 1 });

        let isLiked = false;
        let isBookmarked = false;
        if (authUser) {
            isLiked = !!(await Like.findOne({ story: id, user: authUser.id }));
            isBookmarked = !!(await Bookmark.findOne({ story: id, user: authUser.id }));
        }

        return NextResponse.json({
            story,
            chapters,
            isLiked,
            isBookmarked,
        });
    } catch (error) {
        console.error('Get story error:', error);
        return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const story = await Story.findById(id);

        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const storyAuthorId = story.author?._id?.toString() || story.author?.toString();
        const userId = authUser.id || authUser._id;
        if (storyAuthorId !== userId && authUser.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = ['title', 'description', 'genre', 'visibility', 'coverImage', 'tags'];
        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        const updated = await Story.findByIdAndUpdate(id, updates, { new: true })
            .populate('author', 'name avatar');

        return NextResponse.json({ story: updated });
    } catch (error) {
        console.error('Update story error:', error);
        return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const story = await Story.findById(id);

        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const storyAuthorId = story.author?._id?.toString() || story.author?.toString();
        const userId = authUser.id || authUser._id;
        if (storyAuthorId !== userId && authUser.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await Promise.all([
            Chapter.deleteMany({ story: id }),
            Like.deleteMany({ story: id }),
            Bookmark.deleteMany({ story: id }),
            Comment.deleteMany({ story: id }),
            Story.findByIdAndDelete(id),
        ]);

        return NextResponse.json({ message: 'Story deleted' });
    } catch (error) {
        console.error('Delete story error:', error);
        return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
    }
}
