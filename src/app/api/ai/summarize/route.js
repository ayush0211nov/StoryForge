import { NextResponse } from 'next/server';
import { storyAssist } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const summary = await storyAssist(text, 'summarize');

        return NextResponse.json({ result: summary });
    } catch (error) {
        console.error('Summarize error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate summary with HuggingFace' },
            { status: 500 }
        );
    }
}
