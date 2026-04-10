import { NextResponse } from 'next/server';
import { storyAssist } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, mode } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const validModes = ['suggest', 'improve', 'grammar', 'summarize'];
        if (mode && !validModes.includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }

        try {
            const result = await storyAssist(text, mode || 'suggest');
            return NextResponse.json({ result });
        } catch (error) {
            console.error('Story assist error:', error);
            
            // Provide helpful error messages
            let userMessage = error.message;
            
            if (error.message.includes('API key') || error.message.includes('configured')) {
                userMessage = 'AI Text Tools are not configured. Please set HUGGINGFACE_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in your .env.local file.';
            } else if (error.message.includes('All text generation')) {
                userMessage = 'Text generation is temporarily unavailable. Try again in a moment, or check your API keys.';
            }
            
            return NextResponse.json(
                { error: userMessage },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Story assist route error:', error);
        return NextResponse.json(
            { error: 'Failed to process your request' },
            { status: 500 }
        );
    }
}
