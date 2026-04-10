import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Like from '@/models/Like';
import { getAuthUser } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const existingLike = await Like.findOne({ story: id, user: authUser.id });

        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            await Story.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
            return NextResponse.json({ liked: false });
        } else {
            await Like.create({ story: id, user: authUser.id });
            await Story.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
