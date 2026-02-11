// Gemini API service for generating recommendation pros/cons

interface RecommendationInput {
  foilName: string;
  foilArea: number;
  foilSeries: string;
  userWeight: number;
  userSkill: string;
  userDiscipline: string;
  fbFeedback?: string[];
}

interface ProsCons {
  pros: string[];
  cons: string[];
}

export async function generateProsCons(rec: RecommendationInput): Promise<ProsCons> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('No Gemini API key found');
    return generateFallbackProsCons(rec);
  }

  const fbContext = rec.fbFeedback && rec.fbFeedback.length > 0
    ? `\n\nReal rider feedback from AXIS Riders Facebook group:\n${rec.fbFeedback.join('\n')}`
    : '';

  const prompt = `You are an expert foil advisor. Generate honest pros and cons for this recommendation.

RIDER PROFILE:
- Weight: ${rec.userWeight} lbs
- Skill: ${rec.userSkill}
- Discipline: ${rec.userDiscipline}

RECOMMENDED FOIL:
- Model: ${rec.foilName}
- Area: ${rec.foilArea} cm²
- Series: ${rec.foilSeries}${fbContext}

Generate 3 PROS and 2-3 CONS. Be specific to this rider's profile and foil characteristics.
Format as JSON:
{
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"]
}

Keep each point concise (10-15 words max). Focus on practical riding experience.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        pros: parsed.pros || [],
        cons: parsed.cons || []
      };
    }

    throw new Error('Failed to parse Gemini response');

  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackProsCons(rec);
  }
}

function generateFallbackProsCons(rec: RecommendationInput): ProsCons {
  // Fallback logic if API fails
  const pros: string[] = [];
  const cons: string[] = [];

  // Size-based pros/cons
  const idealArea = rec.userWeight * (rec.userSkill === 'beginner' ? 7.8 : rec.userSkill === 'intermediate' ? 6 : 4.8);
  const sizeDiff = ((rec.foilArea - idealArea) / idealArea) * 100;

  if (Math.abs(sizeDiff) < 10) {
    pros.push(`Ideal size for ${rec.userWeight}lbs ${rec.userSkill} rider`);
  } else if (sizeDiff > 10) {
    pros.push('Extra stability and easier takeoffs');
    cons.push('May feel slow in strong conditions');
  } else {
    pros.push('Fast and responsive feel');
    cons.push('Requires good technique for low-speed flight');
  }

  // Series-based pros/cons
  if (rec.foilSeries.includes('PNG')) {
    pros.push('Legendary pump and glide efficiency');
    pros.push('Connects bumps effortlessly');
    if (rec.userDiscipline === 'wing') {
      cons.push('Can feel slow in tight maneuvers');
    }
  } else if (rec.foilSeries === 'Spitfire') {
    pros.push('Race-proven speed and upwind performance');
    pros.push('Excellent high-wind stability');
    if (rec.userSkill === 'beginner') {
      cons.push('Advanced foil - steep learning curve');
    }
  } else if (rec.foilSeries === 'Surge') {
    pros.push('Perfect balance of pump and turning');
    pros.push('Versatile across conditions');
  } else if (rec.foilSeries === 'BSC') {
    pros.push('Forgiving and confidence-inspiring');
    pros.push('Wide speed range for learning');
    if (rec.userSkill === 'advanced') {
      cons.push('Less responsive than high-aspect options');
    }
  } else if (rec.foilSeries.includes('ART')) {
    pros.push('Exceptional glide and efficiency');
    pros.push('High aspect feel with manageable control');
    cons.push('Premium price point');
  }

  // Discipline-specific
  if (rec.userDiscipline === 'parawing') {
    if (rec.foilSeries.includes('PNG') || rec.foilSeries === 'Spitfire') {
      pros.push('Optimized for wind-powered efficiency');
    }
  }

  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 2)
  };
}
