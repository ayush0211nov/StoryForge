import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Follow from '@/models/Follow';
import { getAuthUser } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        if (authUser.id === id) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        const existing = await Follow.findOne({ follower: authUser.id, following: id });

        if (existing) {
            await Follow.findByIdAndDelete(existing._id);
            await User.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });
            await User.findByIdAndUpdate(authUser.id, { $inc: { followingCount: -1 } });
            return NextResponse.json({ following: false });
        } else {
            await Follow.create({ follower: authUser.id, following: id });
            await User.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });
            await User.findByIdAndUpdate(authUser.id, { $inc: { followingCount: 1 } });
            return NextResponse.json({ following: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
    }
}
