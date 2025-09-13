import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function FAQ() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'general', title: 'General', icon: '❓', color: 'blue' },
    { id: 'account', title: 'Account', icon: '👤', color: 'green' },
    { id: 'orders', title: 'Orders', icon: '📦', color: 'purple' },
    { id: 'shipping', title: 'Shipping', icon: '🚚', color: 'orange' },
    { id: 'payments', title: 'Payments', icon: '💳', color: 'red' },
    { id: 'returns', title: 'Returns', icon: '↩️', color: 'indigo' },
    { id: 'technical', title: 'Technical', icon: '🔧', color: 'gray' }
  ];

  const faqData = {
    general: [
      {
        question: "What is this e-commerce platform?",
        answer: "Our e-commerce platform is a modern, secure online marketplace where you can discover, purchase, and manage a wide variety of products. We offer a seamless shopping experience with features like personalized recommendations, secure payments, and fast delivery.",
        tags: ["platform", "overview", "features"]
      },
      {
        question: "How do I get started?",
        answer: "Getting started is easy! Simply create an account by clicking the 'Sign Up' button, verify your email address, and you're ready to start shopping. You can browse products, add them to your cart, and checkout securely.",
        tags: ["getting-started", "account", "shopping"]
      },
      {
        question: "Is my personal information safe?",
        answer: "Absolutely! We take your privacy and security seriously. All personal information is encrypted and protected using industry-standard security measures. We never share your data with third parties without your explicit consent.",
        tags: ["privacy", "security", "data-protection"]
      },
      {
        question: "Do you offer customer support?",
        answer: "Yes! We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our support team is always ready to help you with any questions or issues you may have.",
        tags: ["support", "help", "contact"]
      }
    ],
    account: [
      {
        question: "How do I create an account?",
        answer: "Creating an account is simple and free. Click the 'Sign Up' button on our homepage, fill in your details (name, email, password), and verify your email address. You'll be ready to shop in minutes!",
        tags: ["signup", "registration", "account-creation"]
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: "No worries! Click 'Forgot Password' on the login page, enter your email address, and we'll send you a secure link to reset your password. The link will expire after 24 hours for security.",
        tags: ["password", "reset", "forgot"]
      },
      {
        question: "Can I change my account information?",
        answer: "Yes, you can update your account information anytime. Go to your profile settings where you can change your name, email, password, shipping address, and other personal details.",
        tags: ["profile", "update", "settings"]
      },
      {
        question: "How do I delete my account?",
        answer: "To delete your account, go to your profile settings and scroll down to the 'Danger Zone' section. Click 'Delete Account' and follow the confirmation steps. Note: This action cannot be undone and will permanently remove all your data.",
        tags: ["delete", "account", "permanent"]
      }
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer: "Placing an order is easy! Browse our products, add items to your cart, review your selection, and proceed to checkout. Enter your shipping and payment information, review your order, and click 'Place Order' to complete your purchase.",
        tags: ["order", "checkout", "purchase"]
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "You can modify or cancel your order within 30 minutes of placing it, as long as it hasn't been processed for shipping. Go to your order history and look for the 'Modify' or 'Cancel' option next to your order.",
        tags: ["modify", "cancel", "order-changes"]
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and going to 'Order History'. Click on any order to see its current status and tracking information.",
        tags: ["tracking", "shipping", "order-status"]
      },
      {
        question: "What if my order is damaged or incorrect?",
        answer: "We're sorry to hear that! Please contact our customer support immediately with your order number and photos of the issue. We'll arrange for a replacement or refund as quickly as possible.",
        tags: ["damaged", "incorrect", "replacement"]
      }
    ],
    shipping: [
      {
        question: "What are your shipping options?",
        answer: "We offer several shipping options to meet your needs: Standard (5-7 business days), Express (2-3 business days), and Overnight (next business day). Shipping costs vary by option and destination.",
        tags: ["shipping", "delivery", "options"]
      },
      {
        question: "How much does shipping cost?",
        answer: "Shipping costs depend on your location and the shipping method you choose. We offer free standard shipping on orders over $50. You can see exact shipping costs during checkout before completing your purchase.",
        tags: ["cost", "free-shipping", "pricing"]
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide! International shipping times vary by destination (typically 7-21 business days). Additional customs fees may apply depending on your country's regulations.",
        tags: ["international", "global", "worldwide"]
      },
      {
        question: "Can I change my shipping address after placing an order?",
        answer: "You can change your shipping address within 2 hours of placing your order, as long as it hasn't been processed for shipping. Contact customer support or use the order modification feature in your account.",
        tags: ["address", "change", "modification"]
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through encrypted payment gateways.",
        tags: ["payment", "credit-card", "paypal"]
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely! We use industry-standard SSL encryption and never store your full payment details on our servers. All payment processing is handled by trusted, PCI-compliant payment processors.",
        tags: ["security", "encryption", "safe"]
      },
      {
        question: "Can I save my payment method for future purchases?",
        answer: "Yes, you can save your payment methods securely in your account for faster checkout. Your payment information is encrypted and stored safely by our payment processor.",
        tags: ["save", "payment-method", "checkout"]
      },
      {
        question: "What if my payment fails?",
        answer: "If your payment fails, please check that your billing information matches your bank records, ensure you have sufficient funds, and try again. If the problem persists, contact your bank or try a different payment method.",
        tags: ["failed", "payment", "troubleshooting"]
      }
    ],
    returns: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like electronics and personal care products may have different return policies.",
        tags: ["return", "policy", "30-days"]
      },
      {
        question: "How do I return an item?",
        answer: "To return an item, go to your order history, select the item you want to return, and click 'Return Item'. Follow the instructions to print a return label and send the item back to us.",
        tags: ["return", "process", "label"]
      },
      {
        question: "How long does it take to process a return?",
        answer: "Once we receive your returned item, we'll process it within 3-5 business days. You'll receive a refund to your original payment method within 5-10 business days after processing.",
        tags: ["processing", "refund", "timeline"]
      },
      {
        question: "Who pays for return shipping?",
        answer: "Return shipping is free for items returned due to defects or our error. For other returns, return shipping costs are deducted from your refund. We provide prepaid return labels for your convenience.",
        tags: ["shipping", "cost", "free"]
      }
    ],
    technical: [
      {
        question: "The website is loading slowly. What should I do?",
        answer: "Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, try using a different browser or contact our technical support team.",
        tags: ["slow", "loading", "performance"]
      },
      {
        question: "I'm having trouble logging in. What can I do?",
        answer: "First, make sure you're using the correct email and password. Check if Caps Lock is on, try resetting your password, or clear your browser cookies. If issues continue, contact our support team.",
        tags: ["login", "password", "troubleshooting"]
      },
      {
        question: "The website doesn't work on my mobile device. Why?",
        answer: "Our website is fully responsive and should work on all devices. Try updating your mobile browser, clearing the cache, or using our mobile app if available. Contact support if problems persist.",
        tags: ["mobile", "responsive", "browser"]
      },
      {
        question: "How do I enable cookies?",
        answer: "Cookies are usually enabled by default. If you're having issues, check your browser settings under 'Privacy' or 'Security' and ensure cookies are allowed for our website.",
        tags: ["cookies", "browser", "settings"]
      }
    ]
  };

  const toggleItem = (categoryId, itemIndex) => {
    const key = `${categoryId}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const searchFAQs = (query) => {
    // This would implement search functionality
    console.log('Searching for:', query);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
                Find answers to common questions about our platform, services, and policies.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    onChange={(e) => searchFAQs(e.target.value)}
                    className="w-full px-6 py-4 pl-14 pr-4 text-lg rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 shadow-lg"
                  />
                  <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                  <nav className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
                          activeCategory === category.id
                            ? `bg-${category.color}-100 text-${category.color}-700 border-l-4 border-${category.color}-500`
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg mr-3">{category.icon}</span>
                        <span className="font-medium">{category.title}</span>
                        <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {faqData[category.id]?.length || 0}
                        </span>
                      </button>
                    ))}
                  </nav>
                  
                  {/* Quick Help */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Still need help?</h4>
                    <p className="text-sm text-gray-600 mb-3">Can't find what you're looking for?</p>
                    <Link
                      to="/contact"
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">
                      {categories.find(cat => cat.id === activeCategory)?.icon}
                    </span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {categories.find(cat => cat.id === activeCategory)?.title} Questions
                      </h2>
                      <p className="text-indigo-100">
                        {faqData[activeCategory]?.length || 0} questions in this category
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="p-8">
                  {faqData[activeCategory]?.map((item, index) => {
                    const key = `${activeCategory}-${index}`;
                    const isOpen = openItems[key];
                    
                    return (
                      <div key={index} className="border-b border-gray-200 last:border-b-0">
                        <button
                          onClick={() => toggleItem(activeCategory, index)}
                          className="w-full text-left py-6 px-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            <div className="flex-shrink-0">
                              <svg
                                className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-6">
                            <div className="prose prose-lg max-w-none">
                              <p className="text-gray-700 leading-relaxed mb-4">
                                {item.answer}
                              </p>
                              
                              {/* Tags */}
                              <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {(!faqData[activeCategory] || faqData[activeCategory].length === 0) && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-gray-600 mb-6">We're working on adding more questions to this category.</p>
                      <Link
                        to="/contact"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Ask a Question
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Help Section */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Still have questions?</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Our support team is here to help you 24/7. Get in touch with us for personalized assistance.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Contact Support
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">User Guide</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Check out our comprehensive user guide for detailed instructions on using our platform.
                  </p>
                  <Link
                    to="/guide"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Guide
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default FAQ;
