import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
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
      const sections = ['overview', 'what-are-cookies', 'types-of-cookies', 'how-we-use-cookies', 'third-party-cookies', 'cookie-management', 'your-choices', 'updates'];
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

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      icon: '🔒',
      color: 'blue',
      description: 'These cookies are necessary for the website to function properly and cannot be disabled.',
      examples: ['Authentication', 'Security', 'Load balancing', 'User preferences']
    },
    {
      name: 'Performance Cookies',
      icon: '📊',
      color: 'green',
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: ['Page views', 'Time spent', 'Error tracking', 'Performance metrics']
    },
    {
      name: 'Functional Cookies',
      icon: '⚙️',
      color: 'purple',
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: ['Language settings', 'Theme preferences', 'Shopping cart', 'User interface']
    },
    {
      name: 'Marketing Cookies',
      icon: '📢',
      color: 'orange',
      description: 'These cookies are used to deliver relevant advertisements and marketing content.',
      examples: ['Ad targeting', 'Campaign tracking', 'Social media', 'Analytics']
    }
  ];

  const cookiePurposes = [
    {
      purpose: 'Website Functionality',
      description: 'Ensuring our website works properly and securely',
      cookies: ['Session management', 'Authentication', 'Security tokens', 'Load balancing']
    },
    {
      purpose: 'User Experience',
      description: 'Providing personalized and enhanced user experience',
      cookies: ['Language preferences', 'Theme settings', 'Shopping cart', 'User interface state']
    },
    {
      purpose: 'Analytics & Performance',
      description: 'Understanding how users interact with our website',
      cookies: ['Page views', 'User behavior', 'Performance metrics', 'Error tracking']
    },
    {
      purpose: 'Marketing & Advertising',
      description: 'Delivering relevant content and advertisements',
      cookies: ['Ad targeting', 'Campaign tracking', 'Social media integration', 'Retargeting']
    }
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and performance tracking',
      cookies: ['_ga', '_gid', '_gat'],
      duration: '2 years',
      moreInfo: 'https://policies.google.com/privacy'
    },
    {
      name: 'Google Ads',
      purpose: 'Advertising and conversion tracking',
      cookies: ['_gcl_au', '_gcl_aw', '_gcl_dc'],
      duration: '90 days',
      moreInfo: 'https://policies.google.com/privacy'
    },
    {
      name: 'Facebook Pixel',
      purpose: 'Social media advertising and analytics',
      cookies: ['_fbp', '_fbc'],
      duration: '90 days',
      moreInfo: 'https://www.facebook.com/privacy/explanation'
    },
    {
      name: 'Cloudflare',
      purpose: 'Security and performance optimization',
      cookies: ['__cfduid', '__cf_bm'],
      duration: '1 year',
      moreInfo: 'https://www.cloudflare.com/privacy/'
    }
  ];

  const managementSteps = [
    {
      step: 1,
      title: 'Browser Settings',
      description: 'Most browsers allow you to control cookies through their settings',
      action: 'Check your browser\'s privacy or security settings'
    },
    {
      step: 2,
      title: 'Cookie Preferences',
      description: 'Use our cookie preference center to manage your choices',
      action: 'Click the "Cookie Settings" button in our footer'
    },
    {
      step: 3,
      title: 'Opt-Out Tools',
      description: 'Use industry-standard opt-out tools for advertising cookies',
      action: 'Visit the Digital Advertising Alliance or Network Advertising Initiative'
    },
    {
      step: 4,
      title: 'Contact Us',
      description: 'Reach out if you have questions about our cookie practices',
      action: 'Use our contact form or email us directly'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Cookie Policy
              </h1>
              <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
                Understanding how we use cookies to enhance your experience and protect your privacy
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-amber-100">
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
                  <span>Your Privacy Matters</span>
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
                      { id: 'what-are-cookies', label: 'What Are Cookies?', icon: '🍪' },
                      { id: 'types-of-cookies', label: 'Types of Cookies', icon: '📋' },
                      { id: 'how-we-use-cookies', label: 'How We Use Cookies', icon: '⚙️' },
                      { id: 'third-party-cookies', label: 'Third-Party Cookies', icon: '🔗' },
                      { id: 'cookie-management', label: 'Cookie Management', icon: '🛠️' },
                      { id: 'your-choices', label: 'Your Choices', icon: '✅' },
                      { id: 'updates', label: 'Policy Updates', icon: '🔄' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                          activeSection === item.id
                            ? 'bg-amber-100 text-amber-700 border-l-4 border-amber-500'
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
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Overview</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    This Cookie Policy explains how our e-commerce platform uses cookies and similar technologies 
                    to enhance your browsing experience, provide personalized content, and improve our services. 
                    We are committed to transparency and giving you control over your privacy.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-amber-800 mb-2">Quick Summary</h3>
                        <p className="text-amber-700 text-sm">
                          We use essential cookies for website functionality, performance cookies for analytics, 
                          functional cookies for personalization, and marketing cookies for advertising. 
                          You can manage your preferences at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* What Are Cookies Section */}
              <section id="what-are-cookies" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🍪</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">What Are Cookies?</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Cookies are small text files that are stored on your device when you visit a website. 
                    They help websites remember information about your visit, such as your preferred language 
                    and other settings, making your next visit easier and the site more useful to you.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        How Cookies Work
                      </h3>
                      <ul className="text-blue-800 text-sm space-y-2">
                        <li>• Stored on your device by your browser</li>
                        <li>• Sent back to the website on future visits</li>
                        <li>• Can be temporary (session) or permanent (persistent)</li>
                        <li>• Help websites provide personalized experiences</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Benefits for You
                      </h3>
                      <ul className="text-green-800 text-sm space-y-2">
                        <li>• Remember your preferences and settings</li>
                        <li>• Keep you logged in between visits</li>
                        <li>• Provide personalized content and recommendations</li>
                        <li>• Improve website performance and security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Types of Cookies Section */}
              <section id="types-of-cookies" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Types of Cookies We Use</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {cookieTypes.map((type, index) => (
                    <div key={index} className={`bg-gradient-to-br from-${type.color}-50 to-${type.color}-100 rounded-xl p-6 border border-${type.color}-200`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{type.icon}</span>
                        <h3 className={`text-xl font-semibold text-${type.color}-900`}>{type.name}</h3>
                      </div>
                      <p className={`text-${type.color}-800 mb-4`}>{type.description}</p>
                      <div>
                        <h4 className={`font-medium text-${type.color}-900 mb-2`}>Examples:</h4>
                        <ul className={`text-${type.color}-700 text-sm space-y-1`}>
                          {type.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How We Use Cookies Section */}
              <section id="how-we-use-cookies" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">How We Use Cookies</h2>
                </div>
                
                <div className="space-y-6">
                  {cookiePurposes.map((purpose, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-indigo-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{purpose.purpose}</h3>
                          <p className="text-gray-600 mb-4">{purpose.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {purpose.cookies.map((cookie, idx) => (
                              <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200 text-center">
                                {cookie}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Third-Party Cookies Section */}
              <section id="third-party-cookies" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Third-Party Cookies</h2>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  We work with trusted third-party services that may set their own cookies on our website. 
                  These services help us provide better functionality, analytics, and advertising.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purpose</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cookies</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">More Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {thirdPartyServices.map((service, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{service.purpose}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {service.cookies.map((cookie, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {cookie}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{service.duration}</td>
                          <td className="px-6 py-4">
                            <a 
                              href={service.moreInfo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Learn More
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Cookie Management Section */}
              <section id="cookie-management" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Cookie Management</h2>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                  You have several options for managing cookies. You can control and delete cookies through 
                  your browser settings, use our cookie preference center, or opt out of specific services.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {managementSteps.map((step, index) => (
                    <div key={index} className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {step.step}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-teal-900 mb-2">{step.title}</h3>
                          <p className="text-teal-800 mb-3">{step.description}</p>
                          <div className="bg-white bg-opacity-50 rounded-lg p-3">
                            <p className="text-teal-700 text-sm font-medium">{step.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Your Choices Section */}
              <section id="your-choices" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Your Choices</h2>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200 mb-8">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Cookie Preference Center</h3>
                  <p className="text-green-800 mb-6">
                    Use our cookie preference center to customize your cookie settings. You can enable or disable 
                    different types of cookies based on your preferences.
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage Cookie Preferences
                  </button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                    <p className="text-gray-600 text-sm">Control cookies through your browser's privacy settings</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Opt-Out Tools</h3>
                    <p className="text-gray-600 text-sm">Use industry tools to opt out of advertising cookies</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
                    <p className="text-gray-600 text-sm">Reach out with questions about our cookie practices</p>
                  </div>
                </div>
              </section>

              {/* Updates Section */}
              <section id="updates" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Policy Updates</h2>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We may update this Cookie Policy from time to time to reflect changes in our practices, 
                    technology, legal requirements, or other factors. We will notify you of any material changes 
                    by posting the updated policy on our website and updating the "Last Updated" date.
                  </p>
                  
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
                    <h3 className="font-semibold text-cyan-900 mb-3">Stay Informed</h3>
                    <p className="text-cyan-800 text-sm mb-4">
                      We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                        Last Updated: {new Date().toLocaleDateString()}
                      </span>
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                        Version: 1.0
                      </span>
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                        Effective Date: {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions About Our Cookie Policy?</h3>
                <p className="text-gray-600 mb-6">
                  If you have any questions about this Cookie Policy or our use of cookies, please don't hesitate to contact us.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/contact" 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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
                    to="/faq" 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    FAQ
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CookiePolicy;
