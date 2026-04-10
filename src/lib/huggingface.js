/**
 * Generate a single image using Hugging Face Router API.
 * Uses FLUX.1-schnell or fallback models for reliable image generation.
 */
export async function generateImage(prompt, aspectRatio = '1:1') {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
        throw new Error('HuggingFace API key is missing. Please add HUGGINGFACE_API_KEY to your .env.local file.');
    }

    try {
        const fullPrompt = `A beautiful, artistic illustration for a storybook: ${prompt}. Style: digital art, vivid colors, high quality, masterpiece.`;
        
        // Using HuggingFace Router API endpoints (api-inference.huggingface.co is deprecated)
        const endpoints = [
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large"
        ];
        
        let lastError = null;
        
        for (const endpoint of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for image generation
                
                console.log(`Attempting image generation with ${endpoint.split('/').pop()}...`);
                
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: fullPrompt }),
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    
                    // Check if model is loading or overloaded
                    if (response.status === 503) {
                        lastError = new Error('Model is loading. Please wait 30 seconds and try again.');
                        console.log(`Model is loading, trying next endpoint...`);
                        continue;
                    }
                    
                    if (response.status === 429) {
                        lastError = new Error('Rate limited. Please wait a moment and try again.');
                        console.log(`Rate limited, trying next endpoint...`);
                        continue;
                    }
                    
                    lastError = new Error(`API Error (${response.status}): ${errorText.substring(0, 100)}`);
                    console.log(`Endpoint failed with status ${response.status}, trying next...`);
                    continue;
                }

                // HuggingFace returns the raw image bytes as blob
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Data = buffer.toString('base64');
                
                // Detect image type from buffer or default to jpeg
                const url = `data:image/jpeg;base64,${base64Data}`;

                console.log(`Successfully generated image (${buffer.byteLength} bytes)`);
                return {
                    url: url,
                    revisedPrompt: prompt
                };
            } catch (endpointError) {
                lastError = endpointError;
                if (endpointError.name === 'AbortError') {
                    console.log(`Endpoint timed out, trying next...`);
                } else {
                    console.log(`Endpoint error: ${endpointError.message}`);
                }
                continue;
            }
        }
        
        // If all endpoints fail
        throw lastError || new Error('All image generation endpoints failed. Please try again later.');
    } catch (error) {
        console.error('HuggingFace image generation error:', error);
        throw new Error(error.message || 'Failed to generate image. Please check your HuggingFace API key and try again.');
    }
}

/**
 * Generate multiple images
 */
export async function generateMultipleImages(prompt, count = 3) {
    try {
        // Run generation requests sequentially or in parallel.
        // Hugging Face might rate-limit free users if done in parallel.
        const promises = Array.from({ length: Math.min(count, 3) }, () => generateImage(prompt));
        const results = await Promise.allSettled(promises);
        
        const successfulImages = results
            .filter(r => r.status === 'fulfilled')
            .map(r => ({ url: r.value.url, revisedPrompt: prompt }));
            
        if (successfulImages.length === 0) {
            throw new Error('All Hugging Face generation requests failed or were rate-limited.');
        }
        
        return successfulImages;
    } catch (error) {
        console.error('Multiple image generation error (HuggingFace):', error);
        throw new Error(error.message || 'Failed to generate images with HuggingFace');
    }
}

/**
 * Generate text or chat completions using HuggingFace Inference API.
 * Tries multiple models and endpoints for maximum compatibility.
 */
export async function generateText(messages, options = {}) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
        throw new Error('HuggingFace API key is missing. Please add HUGGINGFACE_API_KEY to your .env.local file.');
    }

    // Convert messages to a simple prompt format
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    if (!userMessage) {
        throw new Error('No user message found in input');
    }

    // HuggingFace router endpoints that support text generation
    const endpoints = [
        {
            name: 'Mistral-7B-Instruct',
            url: 'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3',
            format: 'simple'
        },
        {
            name: 'TinyLlama-1.1B',
            url: 'https://router.huggingface.co/hf-inference/models/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
            format: 'simple'
        },
        {
            name: 'Flan-T5-Large',
            url: 'https://router.huggingface.co/hf-inference/models/google/flan-t5-large',
            format: 'simple'
        }
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            console.log(`Attempting text generation with ${endpoint.name}...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const payload = {
                inputs: userMessage,
                parameters: {
                    max_new_tokens: options.max_tokens || 1000,
                    temperature: options.temperature || 0.7,
                }
            };

            const response = await fetch(endpoint.url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                
                if (response.status === 503) {
                    console.log(`${endpoint.name} is loading, trying next...`);
                    lastError = new Error(`${endpoint.name} is loading`);
                    continue;
                }
                
                if (response.status === 429) {
                    console.log(`${endpoint.name} rate limited, trying next...`);
                    lastError = new Error(`${endpoint.name} rate limited`);
                    continue;
                }
                
                console.log(`${endpoint.name} failed with status ${response.status}`);
                lastError = new Error(`${endpoint.name} error: ${response.status}`);
                continue;
            }

            const data = await response.json();
            
            // Different models return responses in different formats
            let text = null;
            
            if (Array.isArray(data)) {
                // Most models return an array
                text = data[0]?.generated_text || data[0]?.text || '';
            } else if (data.generated_text) {
                text = data.generated_text;
            } else if (data.text) {
                text = data.text;
            } else if (data.choices?.[0]?.text) {
                text = data.choices[0].text;
            } else if (data.choices?.[0]?.message?.content) {
                text = data.choices[0].message.content;
            }

            if (!text) {
                console.log(`${endpoint.name} returned empty response`);
                lastError = new Error(`${endpoint.name} returned empty response`);
                continue;
            }

            // Remove the prompt from the response if it's included
            if (text.includes(userMessage)) {
                text = text.replace(userMessage, '').trim();
            }

            console.log(`✅ ${endpoint.name} succeeded`);
            return text;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`${endpoint.name} timed out`);
                lastError = new Error(`${endpoint.name} timed out`);
            } else {
                console.log(`${endpoint.name} error: ${error.message}`);
                lastError = error;
            }
            continue;
        }
    }

    // All HuggingFace endpoints failed, throw error and let caller handle fallback
    throw lastError || new Error('All HuggingFace text generation endpoints failed. Please try again.');
}
