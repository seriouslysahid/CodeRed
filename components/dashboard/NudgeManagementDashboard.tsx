'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Brain,
  User,
  Mail,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  GradientCard, 
  AnimatedCounter, 
  PulseGlow, 
  StatusIndicator,
  Card,
  Button,
  Modal,
  Input,
  Select
} from '@/components/ui';
import type { Learner } from '@/lib/types';

interface NudgeData {
  id: number;
  learner_id: number;
  text: string;
  status: 'sent' | 'fallback';
  source: 'gemini' | 'template';
  created_at: string;
}

interface NudgeGenerationResponse {
  text: string;
  source: 'gemini' | 'template';
  streaming: boolean;
  nudgeId: number;
  learnerId: number;
}

const NudgeManagementDashboard: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [nudges, setNudges] = useState<NudgeData[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNudge, setGeneratedNudge] = useState<string>('');
  const [nudgeSource, setNudgeSource] = useState<'gemini' | 'template'>('gemini');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  useEffect(() => {
    fetchLearners();
    fetchNudges();
  }, []);

  const fetchLearners = async () => {
    try {
      const response = await fetch('/api/learners');
      const data = await response.json();
      setLearners(data.data || []);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
    }
  };

  const fetchNudges = async () => {
    try {
      // This would be a new endpoint to fetch nudges
      // For now, we'll simulate the data
      const mockNudges: NudgeData[] = [
        {
          id: 1,
          learner_id: 1,
          text: "Hi Sarah! Ready for your next learning adventure? 🚀",
          status: 'sent',
          source: 'gemini',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          learner_id: 2,
          text: "Quick reminder: Your progress is looking great! Keep it up! 💪",
          status: 'sent',
          source: 'template',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setNudges(mockNudges);
    } catch (error) {
      console.error('Failed to fetch nudges:', error);
    }
  };

  const generateNudge = async (learner: Learner, streaming: boolean = true) => {
    setIsGenerating(true);
    setGeneratedNudge('');
    setStreamingText('');
    setIsStreaming(streaming);

    try {
      if (streaming) {
        // Handle streaming response
        const response = await fetch(`/api/learners/${learner.id}/nudge?streaming=true`);
        
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  setStreamingText(prev => prev + data.text);
                } else if (data.type === 'complete') {
                  setGeneratedNudge(data.text);
                  setNudgeSource(data.source);
                  setIsStreaming(false);
                }
              } catch (parseError) {
                // Skip malformed JSON
              }
            }
          }
        }
      } else {
        // Handle non-streaming response
        const response = await fetch(`/api/learners/${learner.id}/nudge?streaming=false`);
        const data: NudgeGenerationResponse = await response.json();
        
        setGeneratedNudge(data.text);
        setNudgeSource(data.source);
      }
    } catch (error) {
      console.error('Failed to generate nudge:', error);
      setGeneratedNudge(`Hi ${learner.name.split(' ')[0]}, time for a quick study session! You've got this! 🚀`);
      setNudgeSource('template');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendNudge = async (learner: Learner, text: string) => {
    try {
      // This would be a new endpoint to send nudges
      console.log('Sending nudge:', { learner: learner.name, text });
      
      // Add to nudges list
      const newNudge: NudgeData = {
        id: nudges.length + 1,
        learner_id: learner.id,
        text,
        status: 'sent',
        source: nudgeSource,
        created_at: new Date().toISOString(),
      };
      
      setNudges(prev => [newNudge, ...prev]);
      setShowNudgeModal(false);
    } catch (error) {
      console.error('Failed to send nudge:', error);
    }
  };

  const getNudgeStats = () => {
    const totalNudges = nudges.length;
    const sentNudges = nudges.filter(n => n.status === 'sent').length;
    const aiGenerated = nudges.filter(n => n.source === 'gemini').length;
    const templateNudges = nudges.filter(n => n.source === 'template').length;

    return { totalNudges, sentNudges, aiGenerated, templateNudges };
  };

  const stats = getNudgeStats();

  return (
    <div className="space-y-8">
      {/* Nudge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard gradient="primary" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Nudges</p>
              <AnimatedCounter
                value={stats.totalNudges}
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-blue-200 text-xs mt-1">All Time</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="success" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">AI Generated</p>
              <AnimatedCounter
                value={stats.aiGenerated}
                className="text-2xl font-bold"
                color="success"
              />
              <p className="text-green-200 text-xs mt-1">
                {stats.totalNudges > 0 ? Math.round((stats.aiGenerated / stats.totalNudges) * 100) : 0}% of total
              </p>
            </div>
            <Brain className="w-8 h-8 text-green-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="warning" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Template Nudges</p>
              <AnimatedCounter
                value={stats.templateNudges}
                className="text-2xl font-bold"
                color="warning"
              />
              <p className="text-yellow-200 text-xs mt-1">Fallback Messages</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="info" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Success Rate</p>
              <AnimatedCounter
                value={stats.totalNudges > 0 ? Math.round((stats.sentNudges / stats.totalNudges) * 100) : 100}
                suffix="%"
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-cyan-200 text-xs mt-1">Delivered Successfully</p>
            </div>
            <CheckCircle className="w-8 h-8 text-cyan-200" />
          </div>
        </GradientCard>
      </div>

      {/* Quick Actions */}
      <GradientCard gradient="secondary" className="text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">AI Nudge Generation</h3>
            <p className="text-gray-200">
              Generate personalized nudges using AI or send bulk messages
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowNudgeModal(true)}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Send className="w-4 h-4 mr-2" />
              Generate Nudge
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Activity className="w-4 h-4 mr-2" />
              Bulk Send
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-200 text-sm">AI Service</span>
              <StatusIndicator
                status="online"
                size="sm"
                animated={true}
              />
            </div>
            <p className="text-white font-semibold">Gemini AI</p>
            <p className="text-gray-300 text-xs">Real-time generation</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-200 text-sm">Streaming</span>
              <StatusIndicator
                status={isStreaming ? 'loading' : 'online'}
                size="sm"
                animated={isStreaming}
              />
            </div>
            <p className="text-white font-semibold">Live Updates</p>
            <p className="text-gray-300 text-xs">Real-time text generation</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-200 text-sm">Fallback</span>
              <StatusIndicator
                status="online"
                size="sm"
                animated={true}
              />
            </div>
            <p className="text-white font-semibold">Template System</p>
            <p className="text-gray-300 text-xs">Always available</p>
          </div>
        </div>
      </GradientCard>

      {/* Recent Nudges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Nudges</h3>
          <div className="space-y-3">
            {nudges.slice(0, 5).map((nudge) => {
              const learner = learners.find(l => l.id === nudge.learner_id);
              return (
                <motion.div
                  key={nudge.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {learner?.name || 'Unknown Learner'}
                      </span>
                    </div>
                    <StatusIndicator
                      status={nudge.source === 'gemini' ? 'online' : 'warning'}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{nudge.text}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(nudge.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="capitalize">{nudge.source}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nudge Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Generated</span>
              </div>
              <AnimatedCounter
                value={stats.aiGenerated}
                className="text-lg font-bold text-blue-600"
                color="primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Template</span>
              </div>
              <AnimatedCounter
                value={stats.templateNudges}
                className="text-lg font-bold text-yellow-600"
                color="warning"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Success Rate</span>
              </div>
              <AnimatedCounter
                value={stats.totalNudges > 0 ? Math.round((stats.sentNudges / stats.totalNudges) * 100) : 100}
                suffix="%"
                className="text-lg font-bold text-green-600"
                color="success"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Nudge Generation Modal */}
      <Modal
        open={showNudgeModal}
        onOpenChange={setShowNudgeModal}
        title="Generate AI Nudge"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Learner
            </label>
            <Select
              options={learners.map(learner => ({
                value: learner.id.toString(),
                label: `${learner.name} (${learner.email})`,
              }))}
              value={selectedLearner?.id.toString() || ''}
              onChange={(value) => {
                const learner = learners.find(l => l.id.toString() === value);
                setSelectedLearner(learner || null);
              }}
              placeholder="Choose a learner..."
            />
          </div>

          {selectedLearner && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Learner Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedLearner.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{selectedLearner.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completion:</span>
                  <span className="ml-2 font-medium">{selectedLearner.completionPct}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Risk Level:</span>
                  <span className="ml-2 font-medium capitalize">{selectedLearner.riskLabel}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={() => selectedLearner && generateNudge(selectedLearner, true)}
              disabled={!selectedLearner || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Nudge
                </>
              )}
            </Button>
            <Button
              onClick={() => selectedLearner && generateNudge(selectedLearner, false)}
              disabled={!selectedLearner || isGenerating}
              variant="secondary"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Generate
            </Button>
          </div>

          {(generatedNudge || streamingText) && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Generated Nudge</h4>
              <div className="text-sm text-blue-800">
                {isStreaming ? streamingText : generatedNudge}
                {isStreaming && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-blue-600">
                  Source: {nudgeSource === 'gemini' ? 'AI Generated' : 'Template'}
                </span>
                <Button
                  onClick={() => selectedLearner && sendNudge(selectedLearner, generatedNudge || streamingText)}
                  size="sm"
                  disabled={isStreaming}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NudgeManagementDashboard;


