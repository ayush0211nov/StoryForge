/**
 * Simple local-only text generation using templates and patterns.
 * This is a fallback when no external AI APIs are configured.
 * It provides basic creative writing assistance without requiring API keys.
 */

// Creative writing templates and patterns
const templates = {
    suggest: (text) => {
        const sentences = text.split('.').filter(s => s.trim()).slice(-2);
        const lastSentence = sentences[sentences.length - 1] || text;
        
        const suggestions = [
            "Suddenly, the protagonist realized something they had overlooked. Could this be the key to everything?",
            "An unexpected turn of events changed everything. Nobody could have predicted what was about to happen.",
            "As darkness fell, a new mystery emerged. The plot thickened with each passing moment.",
            "The atmosphere grew tense as the characters confronted their deepest fears. What would happen next?",
            "Time seemed to stand still as a crucial decision loomed. Everything hinged on the next choice.",
            "A shocking revelation turned the entire story on its head. Nothing would ever be the same.",
            "In a moment of clarity, the hero discovered a hidden truth. This would change everything.",
            "As hope faded, an unexpected ally appeared. Together, they might just have a chance."
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    },

    improve: (text) => {
        // Simple improvements: make sentences more vivid
        let improved = text;
        
        // Add more vivid descriptors
        improved = improved.replace(/was /g, 'stood ');
        improved = improved.replace(/very /g, 'incredibly ');
        improved = improved.replace(/good/g, 'remarkable');
        improved = improved.replace(/bad/g, 'dreadful');
        improved = improved.replace(/nice/g, 'delightful');
        improved = improved.replace(/big/g, 'towering');
        improved = improved.replace(/small/g, 'diminutive');
        
        // Improve sentence flow
        improved = improved.replace(/\.  /g, '. ');
        improved = improved.replace(/,  /g, ', ');
        
        return improved || text;
    },

    grammar: (text) => {
        let corrected = text;
        
        // Basic grammar fixes
        corrected = corrected.replace(/\b(i|me)\b/g, (match) => match === 'i' ? 'I' : 'me');
        corrected = corrected.replace(/\s{2,}/g, ' '); // Remove multiple spaces
        corrected = corrected.replace(/([.!?])\s+([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase());
        corrected = corrected.replace(/\s+([.,!?;:])/g, '$1'); // Remove space before punctuation
        
        return corrected;
    },

    summarize: (text) => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        if (sentences.length <= 2) return text;
        
        // Keep first and last sentences, find middle one with most important words
        const first = sentences[0].trim();
        const last = sentences[sentences.length - 1].trim();
        const middle = sentences[Math.floor(sentences.length / 2)].trim();
        
        return `${first}. ${middle}. ${last}.`;
    },

    imagePrompt: (text) => {
        // Extract key elements for image generation
        const words = text.toLowerCase().split(/\s+/);
        
        // Look for descriptive words and objects
        const descriptors = ['beautiful', 'magical', 'dark', 'bright', 'mysterious', 'ancient', 'modern', 'vast', 'tiny', 'grand'];
        const objects = ['forest', 'castle', 'mountain', 'ocean', 'city', 'village', 'temple', 'ruin', 'garden', 'sky'];
        
        let foundDescriptors = [];
        let foundObjects = [];
        
        for (const word of words) {
            if (descriptors.some(d => word.includes(d))) {
                foundDescriptors.push(word);
            }
            if (objects.some(o => word.includes(o))) {
                foundObjects.push(word);
            }
        }
        
        // Build image prompt
        let prompt = 'A fantasy illustration showing';
        
        if (foundDescriptors.length > 0) {
            prompt += ' a ' + foundDescriptors[0];
        }
        if (foundObjects.length > 0) {
            prompt += ' ' + foundObjects[0];
        } else {
            prompt += ' scene from the story';
        }
        
        prompt += '. Dramatic composition, vibrant colors, high quality artwork, suitable for a storybook.';
        
        return prompt;
    }
};

/**
 * Generate text using local templates (no API required)
 */
export async function generateText(messages, options = {}) {
    try {
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        
        if (!userMessage) {
            throw new Error('No user message provided');
        }

        // This is a simple local generator - just echo back a template response
        // In a real scenario, this could use NLP libraries or more sophisticated templates
        return `This is a placeholder response. For full AI features, please configure:
        
1. HUGGINGFACE_API_KEY for text generation
2. GEMINI_API_KEY for Google Generative AI
3. OPENROUTER_API_KEY for Meta Llama

User message: ${userMessage.substring(0, 100)}...`;
    } catch (error) {
        console.error('Local text generation error:', error);
        throw error;
    }
}

export { templates };
