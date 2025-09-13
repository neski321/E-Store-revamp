import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🔍' },
    { id: 'data-collection', title: 'Data Collection', icon: '📊' },
    { id: 'data-usage', title: 'Data Usage', icon: '⚙️' },
    { id: 'data-sharing', title: 'Data Sharing', icon: '🤝' },
    { id: 'data-security', title: 'Data Security', icon: '🔒' },
    { id: 'cookies', title: 'Cookies & Tracking', icon: '🍪' },
    { id: 'user-rights', title: 'Your Rights', icon: '👤' },
    { id: 'contact', title: 'Contact Us', icon: '📞' }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Your privacy matters to us. Learn how we collect, use, and protect your personal information.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Last Updated: December 2024
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  GDPR Compliant
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CCPA Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg mr-3">{section.icon}</span>
                        <span className="font-medium">{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Overview Section */}
                <section id="overview" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">🔍</span>
                    <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      Welcome to our e-commerce platform! This Privacy Policy explains how we collect, use, 
                      disclose, and safeguard your information when you visit our website or use our services. 
                      Please read this privacy policy carefully.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">Key Principles</h4>
                      <ul className="text-blue-800 space-y-2">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>We only collect data necessary for our services</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Your data is protected with industry-standard security</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>You have full control over your personal information</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Collection Section */}
                <section id="data-collection" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">📊</span>
                    <h2 className="text-3xl font-bold text-gray-900">Data Collection</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We collect information you provide directly to us, information we obtain automatically, 
                      and information from third parties.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Information You Provide
                        </h4>
                        <ul className="text-green-800 space-y-2 text-sm">
                          <li>• Account information (name, email, password)</li>
                          <li>• Profile information (address, phone number)</li>
                          <li>• Payment information (processed securely)</li>
                          <li>• Communication preferences</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Information We Collect Automatically
                        </h4>
                        <ul className="text-blue-800 space-y-2 text-sm">
                          <li>• Device information and IP address</li>
                          <li>• Browser type and version</li>
                          <li>• Usage patterns and preferences</li>
                          <li>• Cookies and similar technologies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Usage Section */}
                <section id="data-usage" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">⚙️</span>
                    <h2 className="text-3xl font-bold text-gray-900">Data Usage</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We use the information we collect to provide, maintain, and improve our services.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Service Delivery</h4>
                          <p className="text-gray-700">Process orders, manage accounts, and provide customer support</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Personalization</h4>
                          <p className="text-gray-700">Customize your experience and recommend products you might like</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Improvement</h4>
                          <p className="text-gray-700">Analyze usage patterns to improve our services and user experience</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Sharing Section */}
                <section id="data-sharing" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">🤝</span>
                    <h2 className="text-3xl font-bold text-gray-900">Data Sharing</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We do not sell, trade, or otherwise transfer your personal information to third parties 
                      without your consent, except as described in this policy.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">When We Share Information</h4>
                      <ul className="text-yellow-800 space-y-2">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>With service providers who assist in our operations</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>When required by law or to protect our rights</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>In connection with a business transfer or merger</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Security Section */}
                <section id="data-security" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">🔒</span>
                    <h2 className="text-3xl font-bold text-gray-900">Data Security</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We implement appropriate technical and organizational measures to protect your personal 
                      information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-red-50 rounded-xl">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-red-900 mb-2">Encryption</h4>
                        <p className="text-red-800 text-sm">All data is encrypted in transit and at rest</p>
                      </div>
                      
                      <div className="text-center p-6 bg-blue-50 rounded-xl">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">Access Control</h4>
                        <p className="text-blue-800 text-sm">Strict access controls and authentication</p>
                      </div>
                      
                      <div className="text-center p-6 bg-green-50 rounded-xl">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-green-900 mb-2">Monitoring</h4>
                        <p className="text-green-800 text-sm">Continuous security monitoring and updates</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cookies Section */}
                <section id="cookies" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">🍪</span>
                    <h2 className="text-3xl font-bold text-gray-900">Cookies & Tracking</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      We use cookies and similar technologies to enhance your browsing experience and analyze 
                      how you use our website.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                          <p className="text-sm text-gray-600">Required for basic website functionality</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Always Active</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                          <p className="text-sm text-gray-600">Help us understand how visitors interact with our website</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Optional</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                          <p className="text-sm text-gray-600">Used to deliver relevant advertisements</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Optional</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* User Rights Section */}
                <section id="user-rights" className="p-8 border-b border-gray-200">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">👤</span>
                    <h2 className="text-3xl font-bold text-gray-900">Your Rights</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      You have certain rights regarding your personal information. We respect these rights 
                      and provide you with the ability to exercise them.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Access Your Data</h4>
                            <p className="text-sm text-gray-600">Request a copy of your personal information</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Correct Your Data</h4>
                            <p className="text-sm text-gray-600">Update or correct inaccurate information</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Delete Your Data</h4>
                            <p className="text-sm text-gray-600">Request deletion of your personal information</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Port Your Data</h4>
                            <p className="text-sm text-gray-600">Export your data in a portable format</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Object to Processing</h4>
                            <p className="text-sm text-gray-600">Opt out of certain data processing activities</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Withdraw Consent</h4>
                            <p className="text-sm text-gray-600">Revoke consent for data processing</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="p-8">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">📞</span>
                    <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      If you have any questions about this Privacy Policy or our data practices, 
                      please don't hesitate to contact us.
                    </p>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-700">privacy@ecommerce.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-gray-700">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-700">123 Privacy Street, Data City, DC 12345</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                          <div className="space-y-3">
                            <Link
                              to="/contact"
                              className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-gray-700">Send us a message</span>
                              </div>
                            </Link>
                            
                            <Link
                              to="/profile"
                              className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700">Manage your data</span>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;
