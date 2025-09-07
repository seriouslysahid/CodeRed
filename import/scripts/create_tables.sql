-- scripts/create_tables.sql
-- Database schema for CodeRed Learner Engagement Platform

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create learners table
CREATE TABLE IF NOT EXISTS learners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  completion_pct DECIMAL(5,2) DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
  quiz_avg DECIMAL(5,2) DEFAULT 0 CHECK (quiz_avg >= 0 AND quiz_avg <= 100),
  missed_sessions INTEGER DEFAULT 0 CHECK (missed_sessions >= 0),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  risk_score DECIMAL(5,4) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 1),
  risk_label VARCHAR(10) DEFAULT 'low' CHECK (risk_label IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nudges table
CREATE TABLE IF NOT EXISTS nudges (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'fallback')),
  source VARCHAR(20) NOT NULL CHECK (source IN ('gemini', 'template')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);
CREATE INDEX IF NOT EXISTS idx_learners_last_login ON learners(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_learners_risk_score ON learners(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_learners_risk_label ON learners(risk_label);
CREATE INDEX IF NOT EXISTS idx_learners_created_at ON learners(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learners_updated_at ON learners(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_nudges_learner_id ON nudges(learner_id);
CREATE INDEX IF NOT EXISTS idx_nudges_created_at ON nudges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nudges_status ON nudges(status);
CREATE INDEX IF NOT EXISTS idx_nudges_source ON nudges(source);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on learners table
DROP TRIGGER IF EXISTS update_learners_updated_at ON learners;
CREATE TRIGGER update_learners_updated_at
    BEFORE UPDATE ON learners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for learner statistics (optional, for reporting)
CREATE OR REPLACE VIEW learner_stats AS
SELECT 
  risk_label,
  COUNT(*) as count,
  AVG(completion_pct) as avg_completion,
  AVG(quiz_avg) as avg_quiz_score,
  AVG(missed_sessions) as avg_missed_sessions,
  AVG(risk_score) as avg_risk_score
FROM learners 
GROUP BY risk_label;

-- Create view for recent nudges (optional, for monitoring)
CREATE OR REPLACE VIEW recent_nudges AS
SELECT 
  n.id,
  n.learner_id,
  l.name as learner_name,
  l.email as learner_email,
  n.text,
  n.status,
  n.source,
  n.created_at
FROM nudges n
JOIN learners l ON n.learner_id = l.id
ORDER BY n.created_at DESC
LIMIT 100;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON learners TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nudges TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE learners_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE nudges_id_seq TO your_app_user;