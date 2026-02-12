import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ContributionData {
  name?: string;
  email?: string;
  weight: string;
  weightUnit: 'kg' | 'lbs';
  weightKg: number;
  frontWing: string;
  rearWing?: string;
  fuselage?: string;
  mast?: string;
  board?: string;
  disciplines: string[];
  conditions?: string;
  upgradedFrom?: string;
  verdict?: string;
  listAsContributor: boolean;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContributionData = await request.json();
    
    // Validate required fields
    if (!data.weight || !data.frontWing || !data.disciplines?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add metadata
    const contribution = {
      id: `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      source: 'axis-advisor-contribute-form',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // Try to save to local file (works in development)
    try {
      const contributionsPath = path.join(process.cwd(), 'data', 'contributions.json');
      
      let contributions = [];
      try {
        const existingData = await fs.readFile(contributionsPath, 'utf-8');
        contributions = JSON.parse(existingData);
      } catch {
        // File doesn't exist yet, start with empty array
      }
      
      contributions.push(contribution);
      
      // Ensure data directory exists
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
      await fs.writeFile(contributionsPath, JSON.stringify(contributions, null, 2));
      
      console.log('Saved contribution locally:', contribution.id);
    } catch (fileError) {
      // File write failed (expected on Vercel production)
      console.log('Local file write skipped (production mode)');
    }

    // Send to Discord webhook if configured
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      try {
        const discordMessage = {
          embeds: [{
            title: '🎯 New Setup Contribution!',
            color: 0xDC2626, // Red
            fields: [
              {
                name: '👤 Rider',
                value: `${data.name || 'Anonymous'} (${data.weightKg}kg)`,
                inline: true
              },
              {
                name: '🏄 Discipline',
                value: data.disciplines.join(', '),
                inline: true
              },
              {
                name: '🔴 Front Wing',
                value: data.frontWing,
                inline: true
              },
              {
                name: '🔵 Rear Wing',
                value: data.rearWing || 'Not specified',
                inline: true
              },
              {
                name: '📏 Fuselage',
                value: data.fuselage || 'Not specified',
                inline: true
              },
              {
                name: '📊 Mast',
                value: data.mast || 'Not specified',
                inline: true
              },
              {
                name: '🌊 Conditions',
                value: data.conditions || 'Not specified',
                inline: false
              },
              {
                name: '⬆️ Upgraded From',
                value: data.upgradedFrom || 'Not specified',
                inline: false
              },
              {
                name: '💬 Verdict',
                value: data.verdict || 'No review provided',
                inline: false
              }
            ],
            footer: {
              text: `Submitted via AXIS Advisor • ${new Date().toLocaleString()}`
            }
          }]
        };

        await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordMessage)
        });
        
        console.log('Sent to Discord webhook');
      } catch (discordError) {
        console.error('Discord webhook failed:', discordError);
      }
    }

    // Send email notification if configured
    const notifyEmail = process.env.NOTIFY_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (notifyEmail && resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'AXIS Advisor <notifications@axis-advisor.vercel.app>',
            to: notifyEmail,
            subject: `New Contribution: ${data.frontWing} from ${data.name || 'Anonymous'}`,
            html: `
              <h2>New Setup Submitted</h2>
              <p><strong>Rider:</strong> ${data.name || 'Anonymous'} (${data.weightKg}kg)</p>
              <p><strong>Front Wing:</strong> ${data.frontWing}</p>
              <p><strong>Rear Wing:</strong> ${data.rearWing || 'N/A'}</p>
              <p><strong>Fuselage:</strong> ${data.fuselage || 'N/A'}</p>
              <p><strong>Discipline:</strong> ${data.disciplines.join(', ')}</p>
              <p><strong>Conditions:</strong> ${data.conditions || 'N/A'}</p>
              <p><strong>Upgraded From:</strong> ${data.upgradedFrom || 'N/A'}</p>
              <p><strong>Verdict:</strong> ${data.verdict || 'N/A'}</p>
              <hr>
              <p><small>Submitted at ${data.submittedAt}</small></p>
            `
          })
        });
        console.log('Sent email notification');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: contribution.id,
      message: 'Thank you for contributing!' 
    });

  } catch (error) {
    console.error('Contribution error:', error);
    return NextResponse.json(
      { error: 'Failed to process contribution' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve contributions (protected, for admin use)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contributionsPath = path.join(process.cwd(), 'data', 'contributions.json');
    const data = await fs.readFile(contributionsPath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]);
  }
}
