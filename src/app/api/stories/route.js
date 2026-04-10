import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const genre = searchParams.get('genre');
        const sort = searchParams.get('sort') || 'latest';
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const author = searchParams.get('author');
        const visibility = searchParams.get('visibility');

        let query = { visibility: 'public' };

        const authUser = await getAuthUser(request);
        if (author && authUser && authUser.id === author) {
            query = { author };
            if (visibility) query.visibility = visibility;
        } else if (author) {
            query = { author, visibility: 'public' };
        }

        if (genre && genre !== 'All') query.genre = genre;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        let sortOption = {};
        switch (sort) {
            case 'popular': sortOption = { likesCount: -1 }; break;
            case 'views': sortOption = { viewsCount: -1 }; break;
            case 'oldest': sortOption = { createdAt: 1 }; break;
            default: sortOption = { createdAt: -1 };
        }

        const total = await Story.countDocuments(query);
        const stories = await Story.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name avatar')
            .lean();

        return NextResponse.json({
            stories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get stories error:', error);
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { title, description, genre, visibility, coverImage, tags } = body;

        if (!title || !genre) {
            return NextResponse.json({ error: 'Title and genre are required' }, { status: 400 });
        }

        const story = await Story.create({
            title,
            description: description || '',
            genre,
            author: authUser.id,
            visibility: visibility || 'draft',
            coverImage: coverImage || '',
            tags: tags || [],
        });

        const populated = await Story.findById(story._id).populate('author', 'name avatar');
        return NextResponse.json({ story: populated }, { status: 201 });
    } catch (error) {
        console.error('Create story error:', error);
        return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }
}
