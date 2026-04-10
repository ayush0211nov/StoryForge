import { NextResponse } from 'next/server';
import { generateImage, generateMultipleImages, extractImagePrompt } from '@/lib/ai';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, prompt, count } = await request.json();

        let imagePrompt = prompt;
        if (!imagePrompt && text) {
            try {
                // Attempt to summarize text into a good image prompt using OpenAI
                imagePrompt = await extractImagePrompt(text);
            } catch (promptError) {
                // If the user doesn't have an OpenAI API key configred, just use the raw text
                console.log('Skipping prompt extraction, falling back to raw text prompt.');
                imagePrompt = text;
            }
        }

        if (!imagePrompt) {
            return NextResponse.json({ error: 'Text or prompt is required' }, { status: 400 });
        }

        if (count && count > 1) {
            const images = await generateMultipleImages(imagePrompt, Math.min(count, 3));
            return NextResponse.json({ images, prompt: imagePrompt });
        }

        const image = await generateImage(imagePrompt);
        return NextResponse.json({ image, prompt: imagePrompt });
    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate image. Please check your HuggingFace API key.' },
            { status: 500 }
        );
    }
}
