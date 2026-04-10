import RunwayML from '@runwayml/sdk';

let _client = null;

function getRunwayClient() {
    if (!_client) {
        _client = new RunwayML({
            apiKey: process.env.RUNWAYML_API_SECRET,
        });
    }
    return _client;
}

/**
 * Generate a single image using Runway's Gen-4 Image model.
 * Uses gen4_image_turbo for faster generation (ideal for story illustrations).
 */
export async function generateImage(prompt, ratio = '1024:1024') {
    try {
        const client = getRunwayClient();

        const task = await client.textToImage
            .create({
                model: 'gen4_image_turbo',
                ratio: ratio,
                promptText: `A beautiful, artistic illustration for a storybook: ${prompt}. Style: digital art, vivid colors, high quality, suitable for a story illustration.`,
                referenceImages: [],
            })
            .waitForTaskOutput();

        return {
            url: task.output[0],
            revisedPrompt: prompt,
        };
    } catch (error) {
        console.error('Runway image generation error:', error);

        // Provide more specific error messages
        if (error?.taskDetails) {
            console.error('Task details:', error.taskDetails);
            throw new Error(`Image generation failed: ${error.taskDetails?.failure || 'Unknown task error'}`);
        }

        throw new Error('Failed to generate image with Runway ML');
    }
}

/**
 * Generate multiple images using Runway's Gen-4 Image model.
 * Runs requests in parallel using Promise.allSettled for resilience.
 */
export async function generateMultipleImages(prompt, count = 3) {
    try {
        const client = getRunwayClient();

        const promises = Array.from({ length: count }, () =>
            client.textToImage
                .create({
                    model: 'gen4_image_turbo',
                    ratio: '1024:1024',
                    promptText: `A beautiful, artistic illustration for a storybook: ${prompt}. Style: digital art, vivid colors, high quality.`,
                    referenceImages: [],
                })
                .waitForTaskOutput()
        );

        const results = await Promise.allSettled(promises);
        return results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => ({
                url: r.value.output[0],
                revisedPrompt: prompt,
            }));
    } catch (error) {
        console.error('Multiple image generation error:', error);
        throw new Error('Failed to generate images with Runway ML');
    }
}
