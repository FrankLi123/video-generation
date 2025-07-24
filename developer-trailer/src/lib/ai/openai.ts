import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ScriptGenerationInput {
  projectTitle: string;
  projectDescription: string;
  personalPhotoUrl?: string;
  productImages: string[];
  targetAudience?: string;
  keyFeatures?: string[];
  tone?: 'professional' | 'casual' | 'energetic' | 'friendly';
  duration?: number; // seconds, default 30
}

export interface GeneratedScript {
  title: string;
  script: string;
  scenes: ScriptScene[];
  duration: number;
  voiceover: string;
  visualCues: string[];
}

export interface ScriptScene {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  voiceover: string;
  visualElements: string[];
  transition?: string;
}

const SCRIPT_GENERATION_PROMPT = `You are an expert video script writer specializing in creating engaging promotional videos for software projects and tech products. 

Your task is to create a compelling 20-30 second video script that will help developers showcase their projects effectively.

Guidelines:
- Keep the script concise and impactful (20-30 seconds when spoken)
- Focus on the problem the project solves and its key benefits
- Use energetic, confident language that builds excitement
- Include clear visual cues for each scene
- Make it suitable for social media sharing (Product Hunt, Twitter, LinkedIn)
- Structure it with a hook, problem/solution, and call-to-action

Return the response as a JSON object with this exact structure:
{
  "title": "Catchy title for the video",
  "script": "Complete script text",
  "scenes": [
    {
      "id": "scene_1",
      "startTime": 0,
      "endTime": 5,
      "description": "Scene description",
      "voiceover": "What will be spoken",
      "visualElements": ["Visual element 1", "Visual element 2"],
      "transition": "fade"
    }
  ],
  "duration": 30,
  "voiceover": "Complete voiceover text",
  "visualCues": ["Overall visual guidance"]
}`;

export async function generateScript(input: ScriptGenerationInput): Promise<GeneratedScript> {
  try {
    console.log('🚀 Starting script generation for project:', input.projectTitle);
    
    const {
      projectTitle,
      projectDescription,
      personalPhotoUrl,
      productImages,
      targetAudience = 'developers and tech enthusiasts',
      keyFeatures = [],
      tone = 'professional',
      duration = 30
    } = input;

    const userPrompt = `
Project Details:
- Title: ${projectTitle}
- Description: ${projectDescription}
- Target Audience: ${targetAudience}
- Key Features: ${keyFeatures.join(', ')}
- Tone: ${tone}
- Duration: ${duration} seconds
- Has Personal Photo: ${personalPhotoUrl ? 'Yes' : 'No'}
- Number of Product Images: ${productImages.length}

Please generate a compelling video script that showcases this project effectively.
`;

    console.log('📝 Sending prompt to OpenAI:', userPrompt);
    console.log('⏱️ Making OpenAI API call...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SCRIPT_GENERATION_PROMPT
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('✅ OpenAI API call completed');
    console.log('📊 Token usage:', completion.usage);
    console.log('📄 Raw response:', response);
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const generatedScript = JSON.parse(response) as GeneratedScript;
    console.log('🎬 Generated script:', generatedScript.title);
    
    // Validate the response structure
    if (!generatedScript.title || !generatedScript.script || !generatedScript.scenes) {
      throw new Error('Invalid script structure returned from OpenAI');
    }

    // Ensure scenes have proper IDs
    generatedScript.scenes = generatedScript.scenes.map((scene, index) => ({
      ...scene,
      id: scene.id || `scene_${index + 1}`
    }));

    console.log('✨ Script generation completed successfully');
    return generatedScript;
  } catch (error) {
    console.error('❌ Error generating script:', error);
    throw new Error(
      error instanceof Error 
        ? `Script generation failed: ${error.message}`
        : 'Script generation failed with unknown error'
    );
  }
}

export async function refineScript(
  originalScript: GeneratedScript, 
  userFeedback: string
): Promise<GeneratedScript> {
  try {
    const refinementPrompt = `
You are refining a video script based on user feedback. Here's the original script:

${JSON.stringify(originalScript, null, 2)}

User Feedback: ${userFeedback}

Please update the script based on the feedback while maintaining the same JSON structure and keeping it within 20-30 seconds duration.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SCRIPT_GENERATION_PROMPT
        },
        {
          role: "user",
          content: refinementPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as GeneratedScript;
  } catch (error) {
    console.error('Error refining script:', error);
    throw new Error(
      error instanceof Error 
        ? `Script refinement failed: ${error.message}`
        : 'Script refinement failed with unknown error'
    );
  }
} 