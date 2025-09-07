'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { User, Calendar, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';

export default function LearnerTable({ learners = [] }: { learners?: any[] }) {
  if (!learners || learners.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No learners to display</p>
      </div>
    );
  }

  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <Clock className="w-3 h-3 mr-1" />
            Medium Risk
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Low Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Learner</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Last Active</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Risk Level</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Progress</th>
            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {learners.map((learner: any, index: number) => (
            <tr key={learner.id || index} className="hover:bg-gray-800/50 transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {learner.name || `Learner ${learner.id || index + 1}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      {learner.email || `ID: ${learner.id || index + 1}`}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{learner.lastActive || 'Never'}</span>
                </div>
              </td>
              <td className="py-4 px-6">
                {getRiskBadge(learner.risk)}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" 
                      style={{ width: `${learner.completionPct || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {learner.completionPct || 0}%
                  </span>
                </div>
              </td>
              <td className="py-4 px-6 text-right">
                <Button 
                  onClick={() => alert(`Viewing learner: ${learner.name || learner.id}`)}
                  variant="ghost"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
