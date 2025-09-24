import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmailTemplateService from '../services/emailTemplateService';
import TemplateAssignmentService from '../services/templateAssignmentService';
import EnhancedTextEditor from '../components/EnhancedTextEditor';

const EmailTemplateManagement = () => {
  const { currentUser, role, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0
  });

  // Template creation/editing states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [unassignData, setUnassignData] = useState(null);
  const [unassignSuccess, setUnassignSuccess] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [sendEmail, setSendEmail] = useState('');
  const [sendVariables, setSendVariables] = useState({});

  // Template form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    template_type: 'newsletter',
    subject: '',
    html_content: '',
    plain_text_content: '',
    description: '',
    is_active: true,
    is_default: false,
    variables: {}
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    purpose: '',
    template: '',
    is_active: true
  });

  // Purpose choices for assignment form - defined early to avoid reference issues
  const allPurposeChoices = TemplateAssignmentService.getPurposeChoices();

  const fetchAssignments = useCallback(async () => {
    console.log('fetchAssignments called with:', { currentUser: !!currentUser, role });
    try {
      setAssignmentsLoading(true);
      const data = await TemplateAssignmentService.getAssignments(currentUser, role);
      console.log('fetchAssignments data received:', data);
      setAssignments(data.assignments);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [currentUser, role]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await EmailTemplateService.getTemplates(templateType, activeOnly, currentUser, role);
      setTemplates(data.templates);
      setStats({
        totalCount: data.total_count
      });
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [templateType, activeOnly, currentUser, role]);

  useEffect(() => {
    // Wait for auth to load before checking permissions
    if (authLoading) {
      return;
    }
    
    // Check if user is admin before fetching templates
    if (currentUser && role === 'admin') {
      fetchTemplates();
      fetchAssignments();
    } else if (currentUser && role !== 'admin') {
      setError('Admin access required to view newsletter templates');
      setLoading(false);
    } else if (!currentUser) {
      setError('Please log in to access this page');
      setLoading(false);
    }
  }, [fetchTemplates, fetchAssignments, currentUser, role, authLoading]);


  const handleCreateTemplate = async () => {
    try {
      setError('');
      await EmailTemplateService.createTemplate(templateForm, currentUser, role);
        setShowCreateModal(false);
        resetTemplateForm();
        await Promise.all([fetchTemplates(), fetchAssignments()]);
    } catch (err) {
      setError(err.message || 'Failed to create template');
      console.error('Error creating template:', err);
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      setError('');
      await EmailTemplateService.updateTemplate(editingTemplate.id, templateForm, currentUser, role);
      setShowEditModal(false);
        setEditingTemplate(null);
        resetTemplateForm();
        await Promise.all([fetchTemplates(), fetchAssignments()]);
    } catch (err) {
      setError(err.message || 'Failed to update template');
      console.error('Error updating template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`Are you sure you want to delete template "${templateName}"?`)) {
      try {
        setError('');
        await EmailTemplateService.deleteTemplate(templateId, currentUser, role);
        await Promise.all([fetchTemplates(), fetchAssignments()]);
      } catch (err) {
        setError(err.message || 'Failed to delete template');
        console.error('Error deleting template:', err);
      }
    }
  };

  // Assignment management functions
  const resetAssignmentForm = () => {
    setAssignmentForm({
      purpose: '',
      template: '',
      is_active: true
    });
  };

  const openAssignmentModal = () => {
    resetAssignmentForm();
    setShowAssignmentModal(true);
  };

  const handleCreateAssignment = async () => {
    try {
      setError('');
      
      // Ensure template ID is a number
      const formData = {
        ...assignmentForm,
        template: parseInt(assignmentForm.template)
      };
      
      await TemplateAssignmentService.createAssignment(formData, currentUser, role);
      setShowAssignmentModal(false);
      resetAssignmentForm();
      await fetchAssignments();
    } catch (err) {
      let errorMessage = 'Failed to create template assignment';
      
      if (err.message && err.message.includes('already exists')) {
        errorMessage = 'This purpose is already assigned to another template. Please choose a different purpose.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error creating assignment:', err);
    }
  };

  const handleUnassignAssignment = (assignmentId, purposeDisplay, templateName) => {
    setUnassignData({
      id: assignmentId,
      purposeDisplay,
      templateName
    });
    setShowUnassignModal(true);
  };

  const confirmUnassignAssignment = async () => {
    if (!unassignData) return;
    
    try {
      setError('');
      await TemplateAssignmentService.unassignAssignment(unassignData.id, currentUser, role);
      await fetchAssignments();
      setShowUnassignModal(false);
      setUnassignData(null);
      
      // Show success notification
      setUnassignSuccess(true);
      setTimeout(() => setUnassignSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to unassign template assignment');
      console.error('Error unassigning assignment:', err);
    }
  };

  const cancelUnassignAssignment = () => {
    setShowUnassignModal(false);
    setUnassignData(null);
  };

  // Helper function to get assignment purpose for a template
  const getAssignmentPurpose = (templateId) => {
    if (!assignments || !Array.isArray(assignments)) {
      return 'Not Assigned';
    }
    
    const assignment = assignments.find(a => 
      a && 
      a.template && 
      (a.template === templateId || a.template.id === templateId) && 
      a.is_active
    );
    
    return assignment ? assignment.purpose_display : 'Not Assigned';
  };

  // Filter out already assigned purposes for the form
  const assignedPurposes = assignments
    .filter(a => a && a.purpose && a.is_active) // Ensure assignment exists and is active
    .map(a => a.purpose);
  const purposeChoices = allPurposeChoices.filter(choice => !assignedPurposes.includes(choice.value));

  const handleSendWithTemplate = async () => {
    try {
      setError('');
      await EmailTemplateService.sendWithTemplate(
        sendingTemplate.id, 
        sendEmail, 
        sendVariables, 
        currentUser, 
        role
      );
      setShowSendModal(false);
      setSendingTemplate(null);
      setSendEmail('');
      setSendVariables({});
    } catch (err) {
      setError(err.message || 'Failed to send newsletter with template');
      console.error('Error sending with template:', err);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      template_type: 'newsletter',
      subject: '',
      html_content: '',
      plain_text_content: '',
      description: '',
      is_active: true,
      is_default: false,
      variables: {}
    });
  };

  const handleTextContentChange = (plainText, htmlContent) => {
    setTemplateForm({
      ...templateForm,
      plain_text_content: plainText,
      html_content: htmlContent
    });
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    
    // Convert HTML to plain text for editing if no plain text exists
    let plainTextContent = template.plain_text_content || '';
    if (!plainTextContent && template.html_content) {
      // Simple HTML to plain text conversion for editing
      plainTextContent = template.html_content
        .replace(/<h1[^>]*>/g, '=== ')
        .replace(/<\/h1>/g, ' ===')
        .replace(/<h2[^>]*>/g, '== ')
        .replace(/<\/h2>/g, ' ==')
        .replace(/<h3[^>]*>/g, '= ')
        .replace(/<\/h3>/g, ' =')
        .replace(/<p[^>]*>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br[^>]*>/g, '\n')
        .replace(/<strong[^>]*>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em[^>]*>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim();
    }
    
    setTemplateForm({
      name: template.name,
      template_type: template.template_type,
      subject: template.subject,
      html_content: template.html_content,
      plain_text_content: plainTextContent,
      description: template.description || '',
      is_active: template.is_active,
      is_default: template.is_default,
      variables: template.variables || {}
    });
    setShowEditModal(true);
  };

  const openSendModal = (template) => {
    setSendingTemplate(template);
    setSendEmail('');
    setSendVariables({});
    setShowSendModal(true);
  };


  const templateTypes = EmailTemplateService.getTemplateTypes();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Email Template Management</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {unassignSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline ml-1"> Template assignment has been successfully removed.</span>
              </div>
            </div>
          )}

          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Template Overview</h2>
              <div className="flex space-x-3">
                <button
                  onClick={openAssignmentModal}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    (assignments?.length || 0) === allPurposeChoices.length
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Manage Assignments</span>
                  {(assignments?.length || 0) === allPurposeChoices.length ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20">
                      {assignments?.length || 0}/{allPurposeChoices.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Create New Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-600">Total Templates</p>
                <p className="text-3xl font-bold text-blue-800">{stats.totalCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-green-600">Active Templates</p>
                <p className="text-3xl font-bold text-green-800">
                  {templates.filter(t => t.is_active).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-purple-600">Default Templates</p>
                <p className="text-3xl font-bold text-purple-800">
                  {templates.filter(t => t.is_default).length}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <label htmlFor="type-filter" className="text-gray-700 font-medium">Type:</label>
                <select
                  id="type-filter"
                  className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  disabled={loading || authLoading}
                >
                  <option value="">All Types</option>
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <label htmlFor="active-filter" className="text-gray-700 font-medium">Show:</label>
                <select
                  id="active-filter"
                  className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={activeOnly ? 'active' : 'all'}
                  onChange={(e) => setActiveOnly(e.target.value === 'active')}
                  disabled={loading || authLoading}
                >
                  <option value="active">Active Only</option>
                  <option value="all">All Templates</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Subject
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Usage
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Assignment
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Created
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading || authLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        {authLoading ? 'Loading user information...' : 'Loading templates...'}
                      </td>
                    </tr>
                  ) : templates.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No templates found
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          <div className="truncate">
                            {template.name}
                            {template.is_default && (
                              <span className="ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                D
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {templateTypes.find(t => t.value === template.template_type)?.label?.slice(0, 8) || template.template_type?.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 truncate">
                          {template.subject}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                            template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {template.is_active ? '✓' : '✗'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {template.usage_count}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            getAssignmentPurpose(template.id) !== 'Not Assigned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getAssignmentPurpose(template.id)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {template.created_at ? new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-5 py-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openSendModal(template)}
                              className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 transition-colors duration-200"
                              title="Send Template"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(template)}
                              className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200"
                              title="Edit Template"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id, template.name)}
                              className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors duration-200"
                              title="Delete Template"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create Email Template</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetTemplateForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        id="template-name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Template Type *
                      </label>
                      <select
                        id="template-type"
                        value={templateForm.template_type}
                        onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {templateTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="template-subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="template-description"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>


                  <div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <strong>💡 Tip:</strong> Use the enhanced editor below to create beautiful emails with simple formatting hints. 
                        The HTML content will be generated automatically. Click the toggle buttons to show/hide different sections.
                      </p>
                    </div>
                    <EnhancedTextEditor
                      value={templateForm.plain_text_content}
                      onChange={handleTextContentChange}
                      placeholder="Enter your email content using the formatting guide below..."
                      showPreview={true}
                      showHelp={true}
                      variables={{
                        email: 'user@example.com',
                        name: 'John Doe',
                        company: 'Your Company',
                        website: window.location.origin,
                        login_url: `${window.location.origin}/login`,
                        unsubscribe_url: `${window.location.origin}/unsubscribe`,
                        support_email: 'support@yourstore.com',
                        shop_url: `${window.location.origin}/products`
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_active}
                        onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_default}
                        onChange={(e) => setTemplateForm({...templateForm, is_default: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Default for this type</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetTemplateForm();
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.html_content.trim()}
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {showEditModal && editingTemplate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Email Template</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTemplate(null);
                      resetTemplateForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-template-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        id="edit-template-name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-template-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Template Type *
                      </label>
                      <select
                        id="edit-template-type"
                        value={templateForm.template_type}
                        onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {templateTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-template-subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="edit-template-subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-template-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-template-description"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>


                  <div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <strong>💡 Tip:</strong> Use the enhanced editor below to create beautiful emails with simple formatting hints. 
                        The HTML content will be generated automatically. Click the toggle buttons to show/hide different sections.
                      </p>
                    </div>
                    <EnhancedTextEditor
                      value={templateForm.plain_text_content}
                      onChange={handleTextContentChange}
                      placeholder="Enter your email content using the formatting guide below..."
                      showPreview={true}
                      showHelp={true}
                      variables={{
                        email: 'user@example.com',
                        name: 'John Doe',
                        company: 'Your Company',
                        website: window.location.origin,
                        login_url: `${window.location.origin}/login`,
                        unsubscribe_url: `${window.location.origin}/unsubscribe`,
                        support_email: 'support@yourstore.com',
                        shop_url: `${window.location.origin}/products`
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_active}
                        onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_default}
                        onChange={(e) => setTemplateForm({...templateForm, is_default: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Default for this type</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTemplate(null);
                      resetTemplateForm();
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.html_content.trim()}
                  >
                    Update Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send with Template Modal */}
        {showSendModal && sendingTemplate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Send Email with Template</h3>
                  <button
                    onClick={() => {
                      setShowSendModal(false);
                      setSendingTemplate(null);
                      setSendEmail('');
                      setSendVariables({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Template:</strong> {sendingTemplate.name} ({templateTypes.find(t => t.value === sendingTemplate.template_type)?.label})
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Subject:</strong> {sendingTemplate.subject}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="send-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      id="send-email"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter recipient email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Variables (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Use variables like {'{name}'}, {'{company}'}, etc. in your template content
                    </p>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Variable name (e.g., name)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target;
                              const name = input.value.trim();
                              if (name) {
                                setSendVariables({...sendVariables, [name]: ''});
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <span className="text-sm text-gray-500 self-center">Press Enter to add</span>
                      </div>
                      {Object.keys(sendVariables).map(key => (
                        <div key={key} className="flex space-x-2">
                          <span className="px-3 py-2 bg-gray-100 rounded text-sm font-mono">{'{' + key + '}'}</span>
                          <input
                            type="text"
                            value={sendVariables[key]}
                            onChange={(e) => setSendVariables({...sendVariables, [key]: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Value for ${key}`}
                          />
                          <button
                            onClick={() => {
                              const newVars = {...sendVariables};
                              delete newVars[key];
                              setSendVariables(newVars);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSendModal(false);
                      setSendingTemplate(null);
                      setSendEmail('');
                      setSendVariables({});
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendWithTemplate}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={!sendEmail.trim()}
                  >
                    Send Newsletter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Management Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{zIndex: 9999}}>
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Template Assignment Management</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure which templates are used for different email purposes
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      resetAssignmentForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Status Overview */}
                <div className="mb-6">
                  {assignments && assignments.length === allPurposeChoices.length ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">
                          All email purposes are assigned! Your email system is fully configured.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-blue-800">
                          {allPurposeChoices.length - (assignments?.length || 0)} purpose{allPurposeChoices.length - (assignments?.length || 0) !== 1 ? 's' : ''} still need{allPurposeChoices.length - (assignments?.length || 0) === 1 ? 's' : ''} assignment.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Current Assignments Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900">Current Assignments</h4>
                      <div className="flex items-center space-x-2">
                        {assignmentsLoading ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {assignments?.length || 0} Assigned
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {allPurposeChoices.length - (assignments?.length || 0)} Available
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!assignments || assignments.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                        <p className="text-sm text-yellow-700">No template assignments found. Create your first assignment below.</p>
                        <p className="text-xs text-yellow-600 mt-2">
                          Assignments help you automatically use the right template for different email purposes.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Template
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments.map((assignment) => (
                            <tr key={assignment.id}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {assignment.purpose_display}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-500">
                                {assignment.template_name} ({assignment.template_type})
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  assignment.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {assignment.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => handleUnassignAssignment(assignment.id, assignment.purpose_display, assignment.template_name)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
                                  title="Unassign this template from this purpose"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Unassign
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>

                  {/* Create New Assignment */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900">Create New Assignment</h4>
                      {(purposeChoices?.length || 0) === 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          All Purposes Assigned
                        </span>
                      )}
                    </div>
                    
                    {(purposeChoices?.length || 0) === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              Complete Assignment Coverage
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>All available purposes have been assigned to templates. Your email system is fully configured!</p>
                              <p className="mt-1">
                                <strong>Total assignments:</strong> {assignments?.length || 0} of {allPurposeChoices.length} purposes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <p className="text-sm text-blue-700">
                            <strong>Available for assignment:</strong> {purposeChoices?.length || 0} of {allPurposeChoices.length} purposes
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="assignment-purpose" className="block text-sm font-medium text-gray-700 mb-1">
                            Purpose *
                          </label>
                          <select
                            id="assignment-purpose"
                            value={assignmentForm.purpose}
                            onChange={(e) => setAssignmentForm({...assignmentForm, purpose: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a purpose</option>
                            {(purposeChoices || []).map((choice) => (
                              <option key={choice.value} value={choice.value}>
                                {choice.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="assignment-template" className="block text-sm font-medium text-gray-700 mb-1">
                            Template *
                          </label>
                          <select
                            id="assignment-template"
                            value={assignmentForm.template}
                            onChange={(e) => setAssignmentForm({...assignmentForm, template: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a template</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name} ({template.template_type})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      resetAssignmentForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAssignment}
                    disabled={!assignmentForm.purpose || !assignmentForm.template || (purposeChoices?.length || 0) === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(purposeChoices?.length || 0) === 0 ? 'No Available Purposes' : 'Create Assignment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unassign Confirmation Modal */}
        {showUnassignModal && unassignData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{zIndex: 10000}}>
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unassign Template?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to unassign template <strong>"{unassignData.templateName}"</strong> from <strong>"{unassignData.purposeDisplay}"</strong>?
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    This will remove the assignment and make the purpose available for reassignment.
                  </p>
                </div>

                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={cancelUnassignAssignment}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUnassignAssignment}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
};

export default EmailTemplateManagement;
