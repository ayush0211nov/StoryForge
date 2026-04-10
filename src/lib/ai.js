import { 
    generateImage as hfGenerateImage, 
    generateMultipleImages as hfGenerateMultipleImages,
    generateText as hfGenerateText 
} from './huggingface';

// Re-export HuggingFace image generation as the primary image generation functions
export const generateImage = hfGenerateImage;
export const generateMultipleImages = hfGenerateMultipleImages;

/**
 * Generate text using available AI providers with fallback support
 */
async function generateTextWithFallback(messages, options = {}) {
    const errors = [];

    // Try HuggingFace first
    try {
        console.log('Attempting HuggingFace text generation...');
        return await hfGenerateText(messages, options);
    } catch (hfError) {
        console.log('HuggingFace failed:', hfError.message);
        errors.push(`HuggingFace: ${hfError.message}`);
    }

    // Try Google Gemini if API key is available
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            console.log('Attempting Google Gemini...');
            const { generateText: geminiGenerateText } = await import('./gemini');
            return await geminiGenerateText(messages, options);
        } catch (geminiError) {
            console.log('Gemini failed:', geminiError.message);
            errors.push(`Gemini: ${geminiError.message}`);
        }
    }

    // Try OpenRouter if API key is available
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
        try {
            console.log('Attempting OpenRouter...');
            const { generateText: openRouterGenerateText } = await import('./openrouter');
            return await openRouterGenerateText(messages, options);
        } catch (openRouterError) {
            console.log('OpenRouter failed:', openRouterError.message);
            errors.push(`OpenRouter: ${openRouterError.message}`);
        }
    }

    // All providers failed
    const errorSummary = errors.join(' | ');
    console.error('All text generation providers failed:', errorSummary);
    throw new Error(
        `Unable to generate text. No AI providers configured or available. ` +
        `Please configure HUGGINGFACE_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env.local. ` +
        `Errors: ${errorSummary}`
    );
}

export async function storyAssist(text, mode = 'suggest') {
    const prompts = {
        suggest: `You are a creative writing assistant. Based on the following story text, suggest what could happen next in 2-3 paragraphs. Be creative and engaging.\n\nStory so far:\n${text}`,
        improve: `You are an expert editor. Improve the following text while maintaining the author's voice and style. Make it more engaging and vivid.\n\nText:\n${text}`,
        grammar: `Fix any grammar, spelling, and punctuation errors in the following text. Return only the corrected text.\n\nText:\n${text}`,
        summarize: `Summarize the following story in 2-3 sentences, capturing the key plot points and themes.\n\nStory:\n${text}`,
        imagePrompt: `Based on the following story text, generate a concise, vivid image description (max 100 words) that captures the most visual and dramatic scene. Focus on characters, setting, mood, and action.\n\nText:\n${text}`,
    };

    try {
        const messages = [
            { role: 'system', content: 'You are a helpful creative writing assistant. Provide your best direct completion to the user instruction.' },
            { role: 'user', content: prompts[mode] || prompts.suggest }
        ];

        // Use fallback system to try multiple providers
        const responseText = await generateTextWithFallback(messages, {
            max_tokens: 1000,
            temperature: mode === 'grammar' ? 0.1 : 0.8,
        });

        return responseText;
    } catch (error) {
        console.error('Story assist error:', error);
        throw new Error(error.message || 'Failed to get AI assistance. Please configure API keys in .env.local');
    }
}

export async function extractImagePrompt(text) {
    return storyAssist(text, 'imagePrompt');
}
