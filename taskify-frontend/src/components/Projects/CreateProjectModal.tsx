import React, { useState, useEffect } from 'react';
import { X, Palette, Users } from 'lucide-react';
import { CreateProjectCommand, TeamMember } from '../../types';
import { teamApi } from '../../services/api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: CreateProjectCommand) => Promise<void>;
}

interface ColorOption {
  value: string;
  class: string;
  label: string;
}

const predefinedColors: ColorOption[] = [
  { value: '#3B82F6', class: 'bg-blue-500', label: 'Blue' },
  { value: '#10B981', class: 'bg-green-500', label: 'Green' },
  { value: '#F59E0B', class: 'bg-yellow-500', label: 'Yellow' },
  { value: '#EF4444', class: 'bg-red-500', label: 'Red' },
  { value: '#8B5CF6', class: 'bg-purple-500', label: 'Purple' },
  { value: '#F97316', class: 'bg-orange-500', label: 'Orange' },
  { value: '#06B6D4', class: 'bg-cyan-500', label: 'Cyan' },
  { value: '#84CC16', class: 'bg-lime-500', label: 'Lime' },
  { value: '#EC4899', class: 'bg-pink-500', label: 'Pink' },
  { value: '#6B7280', class: 'bg-gray-500', label: 'Gray' }
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState<CreateProjectCommand>({
    name: '',
    description: '',
    color: predefinedColors[0].value,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      // Reset form when modal opens
      setFormData({
        name: '',
        description: '',
        color: predefinedColors[0].value,
      });
      setSelectedMembers([]);
      setError(null);
    }
  }, [isOpen]);

  const loadTeamMembers = async () => {
    try {
      console.log('Loading team members...');
      const response = await teamApi.getTeamMembers();
      console.log('Team members response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('Setting team members:', response.data);
        setTeamMembers(response.data);
      } else {
        const errorMsg = response.message || 'Failed to load team members';
        console.error('Team members error:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Exception loading team members:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load team members';
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the project data with member assignments
      const projectData: CreateProjectCommand = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        memberIds: selectedMembers // Include selected members in project creation
      };

      await onCreate(projectData);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={loading}
            aria-label="Close modal"
            title="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project description"
              disabled={loading}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Project Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${color.class} ${
                    formData.color === color.value
                      ? 'border-gray-400 scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                  title={color.label}
                  aria-label={`Select ${color.label} color`}
                />
              ))}
            </div>
            <div className="mt-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                disabled={loading}
                aria-label="Choose custom color"
                title="Choose custom color"
              />
            </div>
          </div>

          {/* Team Member Assignment */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Assign Team Members
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {teamMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
