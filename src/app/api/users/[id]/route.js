import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Story from '@/models/Story';
import Follow from '@/models/Follow';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const user = await User.findById(id).select('-password -googleId');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stories = await Story.find({ author: id, visibility: 'public' })
            .sort({ createdAt: -1 })
            .populate('author', 'name avatar');

        let isFollowing = false;
        const authUser = await getAuthUser(request);
        if (authUser && authUser.id !== id) {
            isFollowing = !!(await Follow.findOne({ follower: authUser.id, following: id }));
        }

        return NextResponse.json({ user, stories, isFollowing });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
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

        if (authUser.id !== id && authUser.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = ['name', 'bio', 'avatar'];
        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updates[field] = body[field];
        }

        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json({ user: user.toPublicJSON() });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
