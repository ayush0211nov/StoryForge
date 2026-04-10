import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Bookmark from '@/models/Bookmark';
import { getAuthUser } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const existing = await Bookmark.findOne({ story: id, user: authUser.id });

        if (existing) {
            await Bookmark.findByIdAndDelete(existing._id);
            await Story.findByIdAndUpdate(id, { $inc: { bookmarksCount: -1 } });
            return NextResponse.json({ bookmarked: false });
        } else {
            await Bookmark.create({ story: id, user: authUser.id });
            await Story.findByIdAndUpdate(id, { $inc: { bookmarksCount: 1 } });
            return NextResponse.json({ bookmarked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const bookmarks = await Bookmark.find({ user: authUser.id })
            .populate({
                path: 'story',
                populate: { path: 'author', select: 'name avatar' },
            })
            .sort({ createdAt: -1 });

        const stories = bookmarks.map((b) => b.story).filter(Boolean);
        return NextResponse.json({ stories });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }
}
