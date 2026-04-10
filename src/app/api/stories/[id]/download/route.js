import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const story = await Story.findById(id).populate('author', 'name');
        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const chapters = await Chapter.find({ story: id }).sort({ chapterNumber: 1 });

        // Return the data needed to generate PDF client-side
        return NextResponse.json({
            story: {
                title: story.title,
                description: story.description,
                author: story.author.name,
                genre: story.genre,
                coverImage: story.coverImage,
            },
            chapters: chapters.map((c) => ({
                title: c.title,
                content: c.content,
                image: c.image,
                chapterNumber: c.chapterNumber,
            })),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get download data' }, { status: 500 });
    }
}
