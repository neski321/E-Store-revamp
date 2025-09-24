import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TemplateAssignmentService from '../services/templateAssignmentService';
import EmailTemplateService from '../services/emailTemplateService';

const TemplateAssignmentManagement = () => {
  const { currentUser, role, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Form state
  const [assignmentForm, setAssignmentForm] = useState({
    purpose: '',
    template: '',
    is_active: true
  });

  const fetchAssignments = useCallback(async () => {
    try {
      const data = await TemplateAssignmentService.getAssignments(currentUser, role);
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch template assignments');
      console.error('Error fetching assignments:', err);
    }
  }, [currentUser, role]);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await EmailTemplateService.getTemplates(null, true, currentUser, role);
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, [currentUser, role]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser && role === 'admin') {
        setLoading(true);
        try {
          await Promise.all([fetchAssignments(), fetchTemplates()]);
        } finally {
          setLoading(false);
        }
      } else if (currentUser && role !== 'admin') {
        setError('Admin access required to manage template assignments');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, role, authLoading, fetchAssignments, fetchTemplates]);

  const handleCreateAssignment = async () => {
    try {
      setError('');
      console.log('handleCreateAssignment called with form data:', assignmentForm);
      
      // Ensure template ID is a number
      const formData = {
        ...assignmentForm,
        template: parseInt(assignmentForm.template)
      };
      
      console.log('Processed form data:', formData);
      console.log('Current user:', currentUser);
      console.log('User role:', role);
      
      await TemplateAssignmentService.createAssignment(formData, currentUser, role);
      setShowCreateModal(false);
      resetForm();
      await fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to create template assignment');
      console.error('Error creating assignment:', err);
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      setError('');
      
      // Ensure template ID is a number
      const formData = {
        ...assignmentForm,
        template: parseInt(assignmentForm.template)
      };
      
      await TemplateAssignmentService.updateAssignment(
        editingAssignment.id, 
        formData, 
        currentUser, 
        role
      );
      setShowEditModal(false);
      setEditingAssignment(null);
      resetForm();
      await fetchAssignments();
    } catch (err) {
      setError(err.message || 'Failed to update template assignment');
      console.error('Error updating assignment:', err);
    }
  };

  const handleDeleteAssignment = async (assignmentId, purpose) => {
    if (window.confirm(`Are you sure you want to delete the assignment for "${purpose}"?`)) {
      try {
        setError('');
        await TemplateAssignmentService.deleteAssignment(assignmentId, currentUser, role);
        await fetchAssignments();
      } catch (err) {
        setError(err.message || 'Failed to delete template assignment');
        console.error('Error deleting assignment:', err);
      }
    }
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      purpose: assignment.purpose,
      template: assignment.template,
      is_active: assignment.is_active
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setAssignmentForm({
      purpose: '',
      template: '',
      is_active: true
    });
  };

  const purposeChoices = TemplateAssignmentService.getPurposeChoices();

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading user information...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!currentUser || role !== 'admin') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-600">Admin access required</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Template Assignment Management</h1>
            <p className="mt-2 text-gray-600">
              Assign specific email templates to different purposes like welcoming new users or sending newsletters.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Assignments</dt>
                      <dd className="text-lg font-medium text-gray-900">{assignments.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Assignments</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {assignments.filter(a => a.is_active).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Available Templates</dt>
                      <dd className="text-lg font-medium text-gray-900">{templates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Create New Assignment
            </button>
          </div>

          {/* Assignments Table */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Purpose
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Template
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Loading assignments...
                      </td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No template assignments found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {assignment.purpose_display}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 truncate">
                          {assignment.template_name}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {assignment.template_type}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                            assignment.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {assignment.is_active ? '✓' : '✗'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => openEditModal(assignment)}
                              className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200"
                              title="Edit Assignment"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id, assignment.purpose_display)}
                              className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors duration-200"
                              title="Delete Assignment"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Create Assignment Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create Template Assignment</h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="create-purpose" className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose *
                      </label>
                      <select
                        id="create-purpose"
                        value={assignmentForm.purpose}
                        onChange={(e) => setAssignmentForm({...assignmentForm, purpose: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a purpose</option>
                        {purposeChoices.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="create-template" className="block text-sm font-medium text-gray-700 mb-1">
                        Template *
                      </label>
                      <select
                        id="create-template"
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

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assignmentForm.is_active}
                          onChange={(e) => setAssignmentForm({...assignmentForm, is_active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log('Create Assignment button clicked!');
                        console.log('Form state:', assignmentForm);
                        console.log('Button disabled?', !assignmentForm.purpose || !assignmentForm.template);
                        console.log('Purpose value:', assignmentForm.purpose);
                        console.log('Template value:', assignmentForm.template);
                        handleCreateAssignment();
                      }}
                      disabled={!assignmentForm.purpose || !assignmentForm.template}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Assignment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Assignment Modal */}
          {showEditModal && editingAssignment && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Template Assignment</h3>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingAssignment(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-template" className="block text-sm font-medium text-gray-700 mb-1">
                        Template *
                      </label>
                      <select
                        id="edit-template"
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

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assignmentForm.is_active}
                          onChange={(e) => setAssignmentForm({...assignmentForm, is_active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingAssignment(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateAssignment}
                      disabled={!assignmentForm.template}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Assignment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TemplateAssignmentManagement;
