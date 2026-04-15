import Anthropic from '@anthropic-ai/sdk';

export async function getAIResponse(apiKey, systemPrompt, userMessage) {
  if (!apiKey) {
    throw new Error('Please enter your Anthropic API key in the AI Coach settings.');
  }

  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  return response.content[0].text;
}

export const PROMPTS = {
  dailyCoach: {
    system: `You are a supportive personal wellness coach inside an app called LifeOS. 
Keep responses concise (3-4 sentences max). Be warm, specific, and actionable. 
Use 1-2 relevant emoji. Focus on positive reinforcement and one clear next step.`,
    template: (habits, nutrition) => `Here's my data for today:

**Habits completed:** ${habits}

**Nutrition:** ${nutrition}

Give me a brief personalized insight and one specific action suggestion for tomorrow.`
  },

  weeklyReview: {
    system: `You are a personal analytics coach in the LifeOS app. 
Provide a concise weekly summary (4-5 sentences). Mention specific wins with data. 
Identify one key area to improve. Be encouraging but honest. Use 2-3 emoji.`,
    template: (weekData) => `Here's my 7-day tracking history:

${weekData}

Summarize my wins and areas for improvement this week.`
  },

  habitSuggestions: {
    system: `You are a habit design expert in the LifeOS app. 
When given a goal, suggest exactly 5 specific, actionable daily habits. 
Each habit should have an emoji, a name (max 4 words), and one sentence explaining why it helps. 
Format as a numbered list.`,
    template: (goal) => `I want to: ${goal}

Suggest 5 specific daily habits that would help me achieve this goal.`
  }
};
