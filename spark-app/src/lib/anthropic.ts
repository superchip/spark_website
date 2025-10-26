import { Spark } from '@/types';

interface GenerateSparkParams {
  goalTitle: string;
  goalDescription?: string;
  previousSparks?: Spark[];
}

interface SparkResponse {
  title: string;
  description: string;
  effort: string;
  resourceLink: string | null;
}

export async function generateSpark(params: GenerateSparkParams): Promise<SparkResponse> {
  const { goalTitle, goalDescription, previousSparks = [] } = params;

  const previousSparksText = previousSparks.length > 0
    ? `SPARKS ALREADY COMPLETED:\n${previousSparks.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}\n`
    : '';

  const prompt = `You are Spark, an AI that helps people overcome procrastination by generating tiny, achievable first steps.

USER'S GOAL: "${goalTitle}"
${goalDescription ? `GOAL DETAILS: ${goalDescription}\n` : ''}
${previousSparksText}

Generate the next TINY micro-action (a "spark") that will help them make progress. This should be:
- VERY small (2-5 minutes max)
- Immediately actionable
- Low barrier to entry
- Either research/learning OR a tiny preparation step
- NOT the full task, just a baby step toward it

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short action title (under 8 words)",
  "description": "Brief clarifying sentence (under 15 words)",
  "effort": "2-5 min",
  "resourceLink": "optional URL to helpful resource, or null"
}

DO NOT include any text outside the JSON. Make it encouraging and specific to their goal.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY!}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    let responseText = data.choices[0].message.content.trim();

    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const sparkData: SparkResponse = JSON.parse(responseText);

    return sparkData;
  } catch (error) {
    console.error("Error generating spark:", error);

    return {
      title: "Search for beginner guides",
      description: "Spend 2 minutes finding one helpful resource",
      effort: "2-3 min",
      resourceLink: null
    };
  }
}
