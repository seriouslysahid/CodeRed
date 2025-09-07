'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Database, 
  Brain, 
  Zap, 
  Users, 
  Activity, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Settings,
  BarChart3,
  Send,
  RefreshCw
} from 'lucide-react';
import { 
  GradientCard, 
  AnimatedCounter, 
  PulseGlow, 
  StatusIndicator,
  Card,
  Button,
  Modal
} from '@/components/ui';

interface BackendFeature {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  icon: React.ComponentType<any>;
  category: 'api' | 'ai' | 'database' | 'processing';
  status: 'active' | 'testing' | 'planned';
  features: string[];
}

const BackendFeaturesShowcase: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<BackendFeature | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const features: BackendFeature[] = [
    {
      id: 'health-check',
      name: 'Health Monitoring',
      description: 'Comprehensive system health checks with real-time status monitoring',
      endpoint: '/api/health',
      method: 'GET',
      icon: Activity,
      category: 'api',
      status: 'active',
      features: [
        'Real-time system status',
        'Database connectivity checks',
        'External service monitoring',
        'Performance metrics',
        'Error tracking and reporting'
      ]
    },
    {
      id: 'learners-crud',
      name: 'Learner Management',
      description: 'Complete CRUD operations for learner data with pagination and filtering',
      endpoint: '/api/learners',
      method: 'GET/POST/PUT/DELETE',
      icon: Users,
      category: 'api',
      status: 'active',
      features: [
        'Cursor-based pagination',
        'Real-time risk scoring',
        'Bulk operations support',
        'Data validation',
        'Error handling middleware'
      ]
    },
    {
      id: 'ai-nudges',
      name: 'AI Nudge Generation',
      description: 'AI-powered personalized nudge generation with streaming support',
      endpoint: '/api/learners/[id]/nudge',
      method: 'POST',
      icon: Brain,
      category: 'ai',
      status: 'active',
      features: [
        'Gemini AI integration',
        'Real-time streaming',
        'Fallback templates',
        'Circuit breaker pattern',
        'Retry logic with backoff'
      ]
    },
    {
      id: 'risk-simulation',
      name: 'Risk Simulation Engine',
      description: 'Batch risk recomputation with chunked processing for performance',
      endpoint: '/api/simulate',
      method: 'POST',
      icon: BarChart3,
      category: 'processing',
      status: 'active',
      features: [
        'Chunked batch processing',
        'Cursor-based pagination',
        'Performance optimization',
        'Progress tracking',
        'Error recovery'
      ]
    },
    {
      id: 'database-layer',
      name: 'Database Layer',
      description: 'Supabase PostgreSQL with advanced features and security',
      endpoint: 'Supabase',
      method: 'SQL',
      icon: Database,
      category: 'database',
      status: 'active',
      features: [
        'Real-time subscriptions',
        'Row-level security',
        'Automatic backups',
        'Connection pooling',
        'Query optimization'
      ]
    },
    {
      id: 'middleware',
      name: 'Middleware Stack',
      description: 'Comprehensive middleware for validation, error handling, and security',
      endpoint: 'Internal',
      method: 'Middleware',
      icon: Shield,
      category: 'api',
      status: 'active',
      features: [
        'Request validation',
        'Error normalization',
        'Rate limiting',
        'Authentication',
        'Logging and monitoring'
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'api': return 'primary';
      case 'ai': return 'warning';
      case 'database': return 'success';
      case 'processing': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'testing': return 'warning';
      case 'planned': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMethodColor = (method: string) => {
    if (method.includes('GET')) return 'bg-green-100 text-green-800';
    if (method.includes('POST')) return 'bg-blue-100 text-blue-800';
    if (method.includes('PUT')) return 'bg-yellow-100 text-yellow-800';
    if (method.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleFeatureClick = (feature: BackendFeature) => {
    setSelectedFeature(feature);
    setShowFeatureModal(true);
  };

  const stats = {
    totalEndpoints: features.length,
    activeFeatures: features.filter(f => f.status === 'active').length,
    aiFeatures: features.filter(f => f.category === 'ai').length,
    avgResponseTime: 245,
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard gradient="primary" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Features</p>
              <AnimatedCounter
                value={stats.totalEndpoints}
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-blue-200 text-xs mt-1">Backend Capabilities</p>
            </div>
            <Code className="w-8 h-8 text-blue-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="success" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Features</p>
              <AnimatedCounter
                value={stats.activeFeatures}
                className="text-2xl font-bold"
                color="success"
              />
              <p className="text-green-200 text-xs mt-1">Production Ready</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="warning" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">AI Features</p>
              <AnimatedCounter
                value={stats.aiFeatures}
                className="text-2xl font-bold"
                color="warning"
              />
              <p className="text-yellow-200 text-xs mt-1">Intelligence Layer</p>
            </div>
            <Brain className="w-8 h-8 text-yellow-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="info" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Avg Response</p>
              <AnimatedCounter
                value={stats.avgResponseTime}
                suffix="ms"
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-cyan-200 text-xs mt-1">Performance</p>
            </div>
            <Clock className="w-8 h-8 text-cyan-200" />
          </div>
        </GradientCard>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard
                gradient={getCategoryColor(feature.category) as any}
                glow={feature.status === 'active'}
                className="text-white h-full cursor-pointer"
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <PulseGlow intensity="medium" color="blue">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </PulseGlow>
                    <div>
                      <h3 className="text-lg font-bold text-white">{feature.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(feature.method)}`}>
                        {feature.method}
                      </span>
                    </div>
                  </div>
                  <StatusIndicator
                    status={getStatusColor(feature.status) as any}
                    size="sm"
                    animated={feature.status === 'active'}
                  />
                </div>

                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Endpoint:</span>
                    <code className="text-blue-200 bg-white/10 px-2 py-1 rounded">
                      {feature.endpoint}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Category:</span>
                    <span className="text-white font-medium capitalize">{feature.category}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Features:</span>
                    <span className="text-white text-xs font-medium">{feature.features.length} capabilities</span>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Detail Modal */}
      <Modal
        open={showFeatureModal}
        onOpenChange={setShowFeatureModal}
        title={selectedFeature?.name}
        size="lg"
      >
        {selectedFeature && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <selectedFeature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedFeature.name}</h3>
                  <p className="text-sm text-gray-600">{selectedFeature.description}</p>
                </div>
              </div>
              <StatusIndicator
                status={getStatusColor(selectedFeature.status) as any}
                size="md"
                animated={selectedFeature.status === 'active'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Endpoint Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(selectedFeature.method)}`}>
                      {selectedFeature.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Path:</span>
                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                      {selectedFeature.endpoint}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{selectedFeature.category}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedFeature.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedFeature.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedFeature.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Features:</span>
                    <span className="font-medium">{selectedFeature.features.length} capabilities</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedFeature.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowFeatureModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // In a real app, this would open the API documentation
                  console.log('Opening API docs for:', selectedFeature.name);
                }}
              >
                <Code className="w-4 h-4 mr-2" />
                View API Docs
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BackendFeaturesShowcase;


