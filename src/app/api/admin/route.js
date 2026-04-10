import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'stats';

        if (action === 'stats') {
            const [totalUsers, totalStories, totalComments, recentStories] = await Promise.all([
                User.countDocuments(),
                Story.countDocuments(),
                Comment.countDocuments(),
                Story.find().sort({ createdAt: -1 }).limit(10).populate('author', 'name email'),
            ]);
            return NextResponse.json({ totalUsers, totalStories, totalComments, recentStories });
        }

        if (action === 'users') {
            const page = parseInt(searchParams.get('page') || '1');
            const users = await User.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * 20)
                .limit(20);
            const total = await User.countDocuments();
            return NextResponse.json({ users, total });
        }

        if (action === 'stories') {
            const page = parseInt(searchParams.get('page') || '1');
            const stories = await Story.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * 20)
                .limit(20)
                .populate('author', 'name email');
            const total = await Story.countDocuments();
            return NextResponse.json({ stories, total });
        }

        if (action === 'comments') {
            const page = parseInt(searchParams.get('page') || '1');
            const comments = await Comment.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * 20)
                .limit(20)
                .populate('user', 'name email')
                .populate('story', 'title');
            const total = await Comment.countDocuments();
            return NextResponse.json({ comments, total });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Admin operation failed' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        if (type === 'story') {
            await Promise.all([
                Chapter.deleteMany({ story: id }),
                Comment.deleteMany({ story: id }),
                Story.findByIdAndDelete(id),
            ]);
            return NextResponse.json({ message: 'Story deleted' });
        }

        if (type === 'comment') {
            const comment = await Comment.findById(id);
            if (comment) {
                await Story.findByIdAndUpdate(comment.story, { $inc: { commentsCount: -1 } });
                await Comment.findByIdAndDelete(id);
            }
            return NextResponse.json({ message: 'Comment deleted' });
        }

        if (type === 'user') {
            await User.findByIdAndUpdate(id, { role: 'banned' });
            return NextResponse.json({ message: 'User banned' });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Admin operation failed' }, { status: 500 });
    }
}
