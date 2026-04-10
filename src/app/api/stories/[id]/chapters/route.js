import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import { getAuthUser } from '@/lib/auth';
import { estimateReadingTime } from '@/lib/utils';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const chapters = await Chapter.find({ story: id }).sort({ chapterNumber: 1 });
        return NextResponse.json({ chapters });
    } catch (error) {
        console.error('Get chapters error:', error);
        return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
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
        const { title, content, image, imagePrompt } = body;

        const lastChapter = await Chapter.findOne({ story: id }).sort({ chapterNumber: -1 });
        const chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;

        const chapter = await Chapter.create({
            story: id,
            chapterNumber,
            title: title || `Chapter ${chapterNumber}`,
            content: content || '',
            image: image || '',
            imagePrompt: imagePrompt || '',
        });

        // Update story stats
        const allChapters = await Chapter.find({ story: id });
        const totalContent = allChapters.map((c) => c.content).join(' ');
        await Story.findByIdAndUpdate(id, {
            chaptersCount: allChapters.length,
            readingTime: estimateReadingTime(totalContent),
        });

        return NextResponse.json({ chapter }, { status: 201 });
    } catch (error) {
        console.error('Create chapter error:', error);
        return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
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

        const storyAuthorId = story?.author?._id?.toString() || story?.author?.toString();
        const userId = authUser.id || authUser._id;
        if (!story || (storyAuthorId !== userId && authUser.role !== 'admin')) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const body = await request.json();
        const { chapterId, title, content, image, imagePrompt } = body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (image !== undefined) updates.image = image;
        if (imagePrompt !== undefined) updates.imagePrompt = imagePrompt;

        const chapter = await Chapter.findByIdAndUpdate(chapterId, updates, { new: true });

        // Update reading time
        const allChapters = await Chapter.find({ story: id });
        const totalContent = allChapters.map((c) => c.content).join(' ');
        await Story.findByIdAndUpdate(id, {
            readingTime: estimateReadingTime(totalContent),
        });

        return NextResponse.json({ chapter });
    } catch (error) {
        console.error('Update chapter error:', error);
        return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
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

        const storyAuthorId = story?.author?._id?.toString() || story?.author?.toString();
        const userId = authUser.id || authUser._id;
        if (!story || (storyAuthorId !== userId && authUser.role !== 'admin')) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const chapterId = searchParams.get('chapterId');

        await Chapter.findByIdAndDelete(chapterId);

        // Reorder chapters
        const remaining = await Chapter.find({ story: id }).sort({ chapterNumber: 1 });
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].chapterNumber = i + 1;
            await remaining[i].save();
        }

        await Story.findByIdAndUpdate(id, { chaptersCount: remaining.length });

        return NextResponse.json({ message: 'Chapter deleted' });
    } catch (error) {
        console.error('Delete chapter error:', error);
        return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
    }
}
