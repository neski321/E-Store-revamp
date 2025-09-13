import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'acceptance', 'use-of-service', 'user-accounts', 'products-services', 'payment-terms', 'intellectual-property', 'user-content', 'prohibited-uses', 'termination', 'disclaimers', 'limitation-liability', 'governing-law', 'changes', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceFeatures = [
    {
      title: 'E-Commerce Platform',
      description: 'Online marketplace for buying and selling products',
      icon: '🛒',
      color: 'blue'
    },
    {
      title: 'User Accounts',
      description: 'Personalized accounts with order history and preferences',
      icon: '👤',
      color: 'green'
    },
    {
      title: 'Payment Processing',
      description: 'Secure payment processing and order management',
      icon: '💳',
      color: 'purple'
    },
    {
      title: 'Customer Support',
      description: '24/7 customer support and assistance',
      icon: '🎧',
      color: 'orange'
    }
  ];

  const prohibitedUses = [
    'Violating any applicable laws or regulations',
    'Transmitting harmful or malicious code',
    'Attempting to gain unauthorized access',
    'Interfering with service operations',
    'Collecting user information without permission',
    'Impersonating another person or entity',
    'Engaging in fraudulent activities',
    'Spamming or sending unsolicited communications'
  ];

  const paymentTerms = [
    {
      method: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, American Express accepted',
      processing: 'Secure processing through Stripe',
      fees: 'No additional fees'
    },
    {
      method: 'PayPal',
      description: 'PayPal account or guest checkout',
      processing: 'Direct PayPal integration',
      fees: 'PayPal fees may apply'
    },
    {
      method: 'Bank Transfer',
      description: 'Direct bank transfer for large orders',
      processing: 'Manual processing within 1-2 business days',
      fees: 'Bank transfer fees may apply'
    }
  ];

  const userRights = [
    {
      right: 'Account Access',
      description: 'Access and manage your account information',
      icon: '🔐'
    },
    {
      right: 'Data Portability',
      description: 'Export your data in a standard format',
      icon: '📤'
    },
    {
      right: 'Account Deletion',
      description: 'Request complete account deletion',
      icon: '🗑️'
    },
    {
      right: 'Privacy Control',
      description: 'Control your privacy and communication preferences',
      icon: '🔒'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
                The legal terms and conditions governing your use of our e-commerce platform
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-indigo-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Last Updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                  <span>Comprehensive Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Your Rights Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                  <nav className="space-y-2">
                    {[
                      { id: 'overview', label: 'Overview', icon: '🏠' },
                      { id: 'acceptance', label: 'Acceptance', icon: '✅' },
                      { id: 'use-of-service', label: 'Use of Service', icon: '⚙️' },
                      { id: 'user-accounts', label: 'User Accounts', icon: '👤' },
                      { id: 'products-services', label: 'Products & Services', icon: '🛒' },
                      { id: 'payment-terms', label: 'Payment Terms', icon: '💳' },
                      { id: 'intellectual-property', label: 'Intellectual Property', icon: '🧠' },
                      { id: 'user-content', label: 'User Content', icon: '📝' },
                      { id: 'prohibited-uses', label: 'Prohibited Uses', icon: '🚫' },
                      { id: 'termination', label: 'Termination', icon: '🔚' },
                      { id: 'disclaimers', label: 'Disclaimers', icon: '⚠️' },
                      { id: 'limitation-liability', label: 'Limitation of Liability', icon: '🛡️' },
                      { id: 'governing-law', label: 'Governing Law', icon: '⚖️' },
                      { id: 'changes', label: 'Changes', icon: '🔄' },
                      { id: 'contact', label: 'Contact', icon: '📞' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                          activeSection === item.id
                            ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-8 md:p-10">
              {/* Overview Section */}
              <section id="overview" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    These Terms of Service ("Terms") govern your use of our e-commerce platform and services. 
                    By accessing or using our website, you agree to be bound by these Terms. Please read them carefully.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {serviceFeatures.map((feature, index) => (
                      <div key={index} className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-xl p-6 border border-${feature.color}-200`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{feature.icon}</span>
                          <h3 className={`text-lg font-semibold text-${feature.color}-900`}>{feature.title}</h3>
                        </div>
                        <p className={`text-${feature.color}-800`}>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Acceptance Section */}
              <section id="acceptance" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Acceptance of Terms</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    By accessing, browsing, or using our website, you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-green-900 mb-3">Agreement to Terms</h3>
                    <ul className="text-green-800 space-y-2">
                      <li>• You must be at least 18 years old to use our services</li>
                      <li>• You have the legal capacity to enter into this agreement</li>
                      <li>• You will comply with all applicable laws and regulations</li>
                      <li>• You will not use our services for any unlawful purpose</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Use of Service Section */}
              <section id="use-of-service" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Use of Service</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Our service provides an online platform for purchasing products and managing your account. 
                    You may use our service for lawful purposes only.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Permitted Uses</h3>
                      <ul className="text-blue-800 space-y-2 text-sm">
                        <li>• Browse and purchase products</li>
                        <li>• Create and manage your account</li>
                        <li>• Leave reviews and ratings</li>
                        <li>• Contact customer support</li>
                        <li>• Use features as intended</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h3 className="font-semibold text-red-900 mb-3">Restrictions</h3>
                      <ul className="text-red-800 space-y-2 text-sm">
                        <li>• No unauthorized access</li>
                        <li>• No reverse engineering</li>
                        <li>• No commercial use without permission</li>
                        <li>• No violation of others' rights</li>
                        <li>• No malicious activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Accounts Section */}
              <section id="user-accounts" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">User Accounts</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    To access certain features of our service, you may need to create an account. 
                    You are responsible for maintaining the security of your account.
                  </p>
                  
                  <div className="space-y-6">
                    {userRights.map((right, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">{right.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-purple-900 mb-2">{right.right}</h3>
                            <p className="text-purple-800">{right.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Products & Services Section */}
              <section id="products-services" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Products & Services</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We offer a wide range of products through our platform. All products are subject to availability 
                    and may be discontinued at any time without notice.
                  </p>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Product Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-orange-800">
                      <div>
                        <h4 className="font-medium mb-2">Pricing & Availability</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Prices subject to change without notice</li>
                          <li>• Products may be out of stock</li>
                          <li>• All prices include applicable taxes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Product Descriptions</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Descriptions are for guidance only</li>
                          <li>• Images may not reflect exact appearance</li>
                          <li>• Specifications may vary</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Terms Section */}
              <section id="payment-terms" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Payment Terms</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Payment is required at the time of purchase. We accept various payment methods 
                    and process payments securely through trusted third-party providers.
                  </p>
                  
                  <div className="space-y-4">
                    {paymentTerms.map((term, index) => (
                      <div key={index} className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-emerald-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-emerald-900 mb-2">{term.method}</h3>
                            <p className="text-emerald-800 mb-2">{term.description}</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Processing: </span>
                                <span className="text-emerald-700">{term.processing}</span>
                              </div>
                              <div>
                                <span className="font-medium">Fees: </span>
                                <span className="text-emerald-700">{term.fees}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Intellectual Property Section */}
              <section id="intellectual-property" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Intellectual Property</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    All content, trademarks, and intellectual property on our platform are owned by us or our licensors. 
                    You may not use our intellectual property without permission.
                  </p>
                  
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
                    <h3 className="font-semibold text-cyan-900 mb-4">Protected Content</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-cyan-800">
                      <div>
                        <h4 className="font-medium mb-2">Our Rights</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Website design and layout</li>
                          <li>• Product descriptions and images</li>
                          <li>• Software and code</li>
                          <li>• Trademarks and logos</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Your Rights</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Personal use of purchased products</li>
                          <li>• Fair use of content for reviews</li>
                          <li>• Access to your account data</li>
                          <li>• Right to privacy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Content Section */}
              <section id="user-content" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">User Content</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    You may submit content such as reviews, comments, and feedback. By submitting content, 
                    you grant us certain rights to use and display that content.
                  </p>
                  
                  <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
                    <h3 className="font-semibold text-pink-900 mb-4">Content Guidelines</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-pink-800">
                      <div>
                        <h4 className="font-medium mb-2">Allowed Content</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Honest product reviews</li>
                          <li>• Helpful comments and feedback</li>
                          <li>• Questions and support requests</li>
                          <li>• Appropriate images and videos</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Prohibited Content</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Spam or promotional content</li>
                          <li>• Offensive or inappropriate material</li>
                          <li>• Copyrighted content without permission</li>
                          <li>• False or misleading information</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prohibited Uses Section */}
              <section id="prohibited-uses" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Prohibited Uses</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    You may not use our service for any unlawful purpose or in any way that could damage, 
                    disable, or impair our service or interfere with other users' enjoyment.
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Prohibited Activities</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {prohibitedUses.map((use, index) => (
                        <div key={index} className="flex items-start gap-2 text-red-800">
                          <svg className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Termination Section */}
              <section id="termination" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔚</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Termination</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We may terminate or suspend your account and access to our service immediately, 
                    without prior notice, for any reason, including breach of these Terms.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Our Rights</h3>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Terminate accounts for violations</li>
                        <li>• Suspend access temporarily</li>
                        <li>• Remove inappropriate content</li>
                        <li>• Block repeat offenders</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Your Rights</h3>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• Close your account anytime</li>
                        <li>• Request data deletion</li>
                        <li>• Appeal termination decisions</li>
                        <li>• Contact support for help</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disclaimers Section */}
              <section id="disclaimers" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Disclaimers</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Our service is provided "as is" without warranties of any kind. We disclaim all warranties, 
                    express or implied, including merchantability and fitness for a particular purpose.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="font-semibold text-yellow-900 mb-4">Important Disclaimers</h3>
                    <div className="space-y-4 text-yellow-800">
                      <div>
                        <h4 className="font-medium mb-2">Service Availability</h4>
                        <p className="text-sm">We do not guarantee uninterrupted access to our service. Maintenance, updates, and technical issues may cause temporary downtime.</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Product Information</h4>
                        <p className="text-sm">Product descriptions, images, and specifications are provided by third parties. We are not responsible for inaccuracies.</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Third-Party Services</h4>
                        <p className="text-sm">We use third-party services for payment processing, analytics, and other functions. We are not responsible for their actions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability Section */}
              <section id="limitation-liability" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Limitation of Liability</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                    special, consequential, or punitive damages arising from your use of our service.
                  </p>
                  
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                    <h3 className="font-semibold text-indigo-900 mb-4">Liability Limitations</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-indigo-800">
                      <div>
                        <h4 className="font-medium mb-2">Excluded Damages</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Lost profits or revenue</li>
                          <li>• Data loss or corruption</li>
                          <li>• Business interruption</li>
                          <li>• Emotional distress</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Maximum Liability</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Limited to amount paid for service</li>
                          <li>• No liability for free services</li>
                          <li>• Exceptions for gross negligence</li>
                          <li>• Subject to applicable law</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Governing Law Section */}
              <section id="governing-law" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Governing Law</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    These Terms are governed by and construed in accordance with the laws of the jurisdiction 
                    where our company is incorporated, without regard to conflict of law principles.
                  </p>
                  
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Legal Framework</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-teal-800">
                      <div>
                        <h4 className="font-medium mb-2">Jurisdiction</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Courts of competent jurisdiction</li>
                          <li>• Local laws apply</li>
                          <li>• International users subject to local law</li>
                          <li>• Dispute resolution procedures</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Dispute Resolution</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Good faith negotiations first</li>
                          <li>• Mediation if needed</li>
                          <li>• Arbitration for complex disputes</li>
                          <li>• Class action waivers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Changes Section */}
              <section id="changes" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Changes to Terms</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We reserve the right to modify these Terms at any time. We will notify users of material 
                    changes by posting the updated Terms on our website and updating the "Last Updated" date.
                  </p>
                  
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                    <h3 className="font-semibold text-rose-900 mb-4">Update Process</h3>
                    <div className="space-y-4 text-rose-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-rose-800">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Notification</h4>
                          <p className="text-sm">We will notify users of significant changes via email or website notice.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-rose-800">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Review Period</h4>
                          <p className="text-sm">Users will have a reasonable period to review changes before they take effect.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-rose-800">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Continued Use</h4>
                          <p className="text-sm">Continued use of our service after changes constitutes acceptance of new Terms.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section id="contact" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Contact Information</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    If you have any questions about these Terms of Service, please contact us using the information below.
                  </p>
                  
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-8 border border-violet-200">
                    <h3 className="text-xl font-semibold text-violet-900 mb-6">Get in Touch</h3>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-violet-800 mb-2">Email Support</h4>
                        <p className="text-violet-700 text-sm">support@estore.com</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-violet-800 mb-2">Legal Inquiries</h4>
                        <p className="text-violet-700 text-sm">legal@estore.com</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        to="/contact" 
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Us
                      </Link>
                      <Link 
                        to="/privacy-policy" 
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Privacy Policy
                      </Link>
                      <Link 
                        to="/cookie-policy" 
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Cookie Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;
