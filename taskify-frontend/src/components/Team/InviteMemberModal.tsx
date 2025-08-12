import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, MapPin, Building } from 'lucide-react';
import { InviteTeamMemberCommand, UserRole, Position, TeamMember } from '../../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (memberData: InviteTeamMemberCommand) => void;
  onUpdate?: (memberId: string, memberData: InviteTeamMemberCommand) => void;
  editingMember?: TeamMember | null;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  onUpdate,
  editingMember,
}) => {
  const [formData, setFormData] = useState<InviteTeamMemberCommand>({
    name: '',
    email: '',
    role: UserRole.MEMBER,
    position: Position.FRONTEND_DEVELOPER, // Changed default since TEAM_MEMBER is removed
    department: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role,
        position: editingMember.position,
        department: editingMember.department || '',
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        email: '',
        role: UserRole.MEMBER,
        position: Position.FRONTEND_DEVELOPER,
        department: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [editingMember, isOpen]);

  const roleOptions = [
    { value: UserRole.ADMIN, label: 'Admin', description: 'Full system access and management' },
    { value: UserRole.MEMBER, label: 'Member', description: 'Regular team member' },
  ];

  const positionOptions = [
    { value: Position.TEAM_LEAD, label: 'Team Lead', description: 'Team leadership role' },
    { value: Position.PROJECT_MANAGER, label: 'Project Manager', description: 'Project management' },
    { value: Position.DIRECTOR, label: 'Director', description: 'Department director' },
    { value: Position.EXECUTIVE, label: 'Executive', description: 'Executive level' },
    { value: Position.FRONTEND_DEVELOPER, label: 'Frontend Developer', description: 'Frontend development specialist' },
    { value: Position.BACKEND_DEVELOPER, label: 'Backend Developer', description: 'Backend development specialist' },
    { value: Position.FULLSTACK_DEVELOPER, label: 'Fullstack Developer', description: 'Full-stack development' },
    { value: Position.DEVOPS_ENGINEER, label: 'DevOps Engineer', description: 'DevOps and infrastructure' },
    { value: Position.QA_ENGINEER, label: 'QA Engineer', description: 'Quality assurance specialist' },
    { value: Position.UIUX_DESIGNER, label: 'UI/UX Designer', description: 'User interface and experience design' },
    { value: Position.DATA_ANALYST, label: 'Data Analyst', description: 'Data analysis specialist' },
    { value: Position.PRODUCT_MANAGER, label: 'Product Manager', description: 'Product management' },
    { value: Position.TECHNICAL_LEAD, label: 'Technical Lead', description: 'Technical leadership' },
    { value: Position.SOFTWARE_ARCHITECT, label: 'Software Architect', description: 'Software architecture' },
    { value: Position.BUSINESS_ANALYST, label: 'Business Analyst', description: 'Business analysis' },
    { value: Position.SYSTEM_ADMINISTRATOR, label: 'System Administrator', description: 'System administration' },
    { value: Position.DATABASE_ADMINISTRATOR, label: 'Database Administrator', description: 'Database management' },
    { value: Position.SECURITY_ENGINEER, label: 'Security Engineer', description: 'Security specialist' },
    { value: Position.MOBILE_APP_DEVELOPER, label: 'Mobile App Developer', description: 'Mobile application development' },
  ];

  const departmentOptions = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Customer Success',
    'Quality Assurance',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.role === undefined || formData.role === null) {
      newErrors.role = 'Role is required';
    }

    if (formData.position === undefined || formData.position === null) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log('Submitting team member data:', {
        ...formData,
        department: formData.department?.trim() || undefined,
      });
      
      const memberData = {
        ...formData,
        department: formData.department?.trim() || undefined,
      };

      if (editingMember && onUpdate) {
        // Update existing member
        await onUpdate(editingMember.id, memberData);
      } else {
        // Invite new member
        await onInvite(memberData);
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        role: UserRole.MEMBER,
        position: Position.FRONTEND_DEVELOPER,
        department: '',
      });
      setErrors({});
      setSubmitError(null);
    } catch (error) {
      console.error(`Failed to ${editingMember ? 'update' : 'invite'} member:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${editingMember ? 'update' : 'invite'} team member. Please try again.`;
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof InviteTeamMemberCommand, value: string | UserRole | Position) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Invite Team Member'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingMember ? 'Update member information' : 'Add a new member to your team'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title="Close modal"
              aria-label="Close invite member modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-800 text-sm">
                    {submitError}
                  </div>
                </div>
              </div>
            )}

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Role *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.role === option.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={(e) => handleInputChange('role', parseInt(e.target.value) as UserRole)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="text-red-600 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            {/* Position and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', parseInt(e.target.value) as Position)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.position ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-label="Select position"
                  title="Select team member position"
                >
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="text-red-600 text-sm mt-1">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select department"
                  title="Select department (optional)"
                >
                  <option value="">Select department (optional)</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (editingMember ? 'Updating...' : 'Inviting...') 
                  : (editingMember ? 'Update Member' : 'Send Invitation')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
