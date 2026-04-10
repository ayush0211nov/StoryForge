import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Comment from '@/models/Comment';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const comments = await Comment.find({ story: id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);
        return NextResponse.json({ comments });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const { text } = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
        }

        const comment = await Comment.create({
            story: id,
            user: authUser.id,
            text: text.trim(),
        });

        await Story.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

        const populated = await Comment.findById(comment._id).populate('user', 'name avatar');
        return NextResponse.json({ comment: populated }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
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
        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('commentId');

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (comment.user.toString() !== authUser.id && authUser.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await Comment.findByIdAndDelete(commentId);
        await Story.findByIdAndUpdate(id, { $inc: { commentsCount: -1 } });

        return NextResponse.json({ message: 'Comment deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
