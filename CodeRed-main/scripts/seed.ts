// scripts/seed.ts
// Seed script for CodeRed Learner Engagement Platform

import { supabaseAdmin } from '../lib/supabase.js';
import { computeRiskScore, riskLabelFromScore } from '../lib/risk.js';
import { log } from '../lib/logger.js';

interface SeedLearner {
  name: string;
  email: string;
  completion_pct: number;
  quiz_avg: number;
  missed_sessions: number;
  last_login: string;
}

// Diverse sample learner data representing different risk profiles
const sampleLearners: SeedLearner[] = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    completion_pct: 95,
    quiz_avg: 92,
    missed_sessions: 0,
    last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    completion_pct: 15,
    quiz_avg: 25,
    missed_sessions: 8,
    last_login: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    completion_pct: 65,
    quiz_avg: 70,
    missed_sessions: 3,
    last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    completion_pct: 88,
    quiz_avg: 85,
    missed_sessions: 1,
    last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    name: 'Eva Martinez',
    email: 'eva.martinez@example.com',
    completion_pct: 45,
    quiz_avg: 55,
    missed_sessions: 5,
    last_login: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
  },
  {
    name: 'Frank Brown',
    email: 'frank.brown@example.com',
    completion_pct: 78,
    quiz_avg: 82,
    missed_sessions: 2,
    last_login: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    name: 'Grace Lee',
    email: 'grace.lee@example.com',
    completion_pct: 32,
    quiz_avg: 38,
    missed_sessions: 6,
    last_login: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() // 18 days ago
  },
  {
    name: 'Henry Taylor',
    email: 'henry.taylor@example.com',
    completion_pct: 92,
    quiz_avg: 89,
    missed_sessions: 0,
    last_login: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    name: 'Iris Chen',
    email: 'iris.chen@example.com',
    completion_pct: 58,
    quiz_avg: 62,
    missed_sessions: 4,
    last_login: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 days ago
  },
  {
    name: 'Jack Anderson',
    email: 'jack.anderson@example.com',
    completion_pct: 8,
    quiz_avg: 15,
    missed_sessions: 10,
    last_login: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // 35 days ago
  }
];

// Sample nudge templates for demonstration
const sampleNudgeTemplates = [
  "Hey {name}, you're doing great! Keep up the momentum with a quick 10-minute session today.",
  "Hi {name}, just a gentle reminder to check out your next lesson. Small steps lead to big wins!",
  "Hello {name}, you're {completion}% complete! How about tackling one more module today?",
  "{name}, your quiz average is {quiz}% - you're on the right track! Try another practice quiz.",
  "Hi {name}, it's been a while! Jump back in with a short review session to get back on track."
];

async function clearExistingData(): Promise<void> {
  log.info('Clearing existing seed data...');
  
  // Delete existing nudges first (due to foreign key constraint)
  const { error: nudgesError } = await supabaseAdmin
    .from('nudges')
    .delete()
    .neq('id', 0); // Delete all records
  
  if (nudgesError) {
    log.warn('Error clearing nudges (may not exist yet)', { error: nudgesError.message });
  }
  
  // Delete existing learners
  const { error: learnersError } = await supabaseAdmin
    .from('learners')
    .delete()
    .neq('id', 0); // Delete all records
  
  if (learnersError) {
    log.warn('Error clearing learners (may not exist yet)', { error: learnersError.message });
  }
  
  log.info('Existing data cleared');
}

async function seedLearners(): Promise<number[]> {
  log.info('Seeding learners...');
  
  const learnersWithRisk = sampleLearners.map(learner => {
    const riskScore = computeRiskScore({
      completionPct: learner.completion_pct,
      quizAvg: learner.quiz_avg,
      missedSessions: learner.missed_sessions,
      lastLogin: learner.last_login
    });
    
    const riskLabel = riskLabelFromScore(riskScore);
    
    return {
      ...learner,
      risk_score: riskScore,
      risk_label: riskLabel
    };
  });
  
  const { data, error } = await supabaseAdmin
    .from('learners')
    .insert(learnersWithRisk)
    .select('id');
  
  if (error) {
    throw new Error(`Failed to seed learners: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from learner insertion');
  }
  
  const learnerIds = data.map(learner => learner.id);
  log.info(`Seeded ${learnerIds.length} learners`, { learnerIds });
  
  return learnerIds;
}

async function seedNudges(learnerIds: number[]): Promise<void> {
  log.info('Seeding sample nudges...');
  
  const nudges = learnerIds.slice(0, 5).map((learnerId, index) => {
    const template = sampleNudgeTemplates[index % sampleNudgeTemplates.length];
    const learner = sampleLearners[index];
    
    const text = template
      .replace('{name}', learner.name.split(' ')[0])
      .replace('{completion}', learner.completion_pct.toString())
      .replace('{quiz}', learner.quiz_avg.toString());
    
    return {
      learner_id: learnerId,
      text,
      status: Math.random() > 0.5 ? 'sent' : 'fallback' as 'sent' | 'fallback',
      source: Math.random() > 0.3 ? 'gemini' : 'template' as 'gemini' | 'template'
    };
  });
  
  const { error } = await supabaseAdmin
    .from('nudges')
    .insert(nudges);
  
  if (error) {
    throw new Error(`Failed to seed nudges: ${error.message}`);
  }
  
  log.info(`Seeded ${nudges.length} sample nudges`);
}

async function displaySeedSummary(): Promise<void> {
  log.info('Generating seed summary...');
  
  // Get learner counts by risk level
  const { data: riskStats, error: riskError } = await supabaseAdmin
    .from('learners')
    .select('risk_label')
    .order('risk_label');
  
  if (riskError) {
    log.error('Failed to get risk statistics', { error: riskError.message });
    return;
  }
  
  const riskCounts = riskStats?.reduce((acc, learner) => {
    acc[learner.risk_label] = (acc[learner.risk_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  // Get nudge counts
  const { count: nudgeCount, error: nudgeError } = await supabaseAdmin
    .from('nudges')
    .select('*', { count: 'exact', head: true });
  
  if (nudgeError) {
    log.error('Failed to get nudge count', { error: nudgeError.message });
    return;
  }
  
  log.info('Seed Summary', {
    totalLearners: sampleLearners.length,
    riskDistribution: riskCounts,
    totalNudges: nudgeCount || 0
  });
  
  console.log('\n🎉 Seeding completed successfully!');
  console.log(`📊 Created ${sampleLearners.length} learners:`);
  console.log(`   - Low risk: ${riskCounts.low || 0}`);
  console.log(`   - Medium risk: ${riskCounts.medium || 0}`);
  console.log(`   - High risk: ${riskCounts.high || 0}`);
  console.log(`💬 Created ${nudgeCount || 0} sample nudges`);
  console.log('\n🚀 Ready to test the API endpoints!');
}

async function main(): Promise<void> {
  try {
    log.info('Starting database seeding process...');
    
    // Check if we can connect to the database
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('learners')
      .select('id')
      .limit(1);
    
    if (healthError && healthError.code === '42P01') {
      console.error('❌ Tables do not exist. Please run the SQL schema first:');
      console.error('   1. Connect to your Supabase database');
      console.error('   2. Run the SQL from scripts/create_tables.sql');
      console.error('   3. Then run this seed script again');
      process.exit(1);
    }
    
    // Clear existing data (idempotent seeding)
    await clearExistingData();
    
    // Seed learners and get their IDs
    const learnerIds = await seedLearners();
    
    // Seed sample nudges
    await seedNudges(learnerIds);
    
    // Display summary
    await displaySeedSummary();
    
  } catch (error) {
    log.error('Seeding failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('❌ Seeding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the seeding process
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}