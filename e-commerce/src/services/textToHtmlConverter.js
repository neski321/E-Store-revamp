/**
 * Text to HTML Converter Service
 * Converts user-friendly plain text with formatting hints to HTML
 */

class TextToHtmlConverter {
  /**
   * Convert enhanced plain text to HTML
   * @param {string} plainText - The enhanced plain text content
   * @param {Object} variables - Variables to replace in the content
   * @returns {string} - Converted HTML content
   */
  static convertToHtml(plainText, variables = {}) {
    if (!plainText) return '';

    let html = plainText;

    // Replace variables first
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      html = html.replace(regex, variables[key]);
    });

    // Convert formatting hints to HTML
    html = this.convertFormatting(html);
    
    // Convert line breaks to proper HTML
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * Convert formatting hints to HTML
   * @param {string} text - Text with formatting hints
   * @returns {string} - Text with HTML formatting
   */
  static convertFormatting(text) {
    // Headers (=== Header ===)
    text = text.replace(/^=== (.+) ===$/gm, '<h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 20px 0 15px 0; text-align: center;">$1</h1>');
    
    // Subheaders (== Subheader ==)
    text = text.replace(/^== (.+) ==$/gm, '<h2 style="color: #555; font-size: 24px; font-weight: bold; margin: 18px 0 12px 0;">$1</h2>');
    
    // Section headers (= Section =)
    text = text.replace(/^= (.+) =$/gm, '<h3 style="color: #667eea; font-size: 20px; font-weight: bold; margin: 15px 0 10px 0; border-left: 4px solid #667eea; padding-left: 15px;">$1</h3>');
    
    // Bold text (**text**)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold; color: #333;">$1</strong>');
    
    // Italic text (*text*)
    text = text.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #555;">$1</em>');
    
    // Highlighted text (##text##)
    text = text.replace(/##(.+?)##/g, '<span style="background-color: #fef3cd; padding: 2px 4px; border-radius: 3px; color: #856404;">$1</span>');
    
    // Important text (!!text!!)
    text = text.replace(/!!(.+?)!!/g, '<span style="color: #dc3545; font-weight: bold;">$1</span>');
    
    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #667eea; text-decoration: none; border-bottom: 1px solid #667eea;">$1</a>');
    
    // Buttons [BUTTON: text](url)
    text = text.replace(/\[BUTTON: ([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">$1</a>');
    
    // Lists (- item)
    text = text.replace(/^- (.+)$/gm, '<li style="margin: 5px 0; color: #555;">$1</li>');
    
    // Wrap consecutive list items in ul tags
    text = text.replace(/(<li[^>]*>.*<\/li>)/gs, (match) => {
      if (!match.includes('<ul')) {
        return `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`;
      }
      return match;
    });
    
    // Clean up duplicate ul tags
    text = text.replace(/<\/ul>\s*<ul[^>]*>/g, '');
    
    // Code blocks (```code```)
    text = text.replace(/```([^`]+)```/g, '<code style="background-color: #f8f9fa; padding: 8px 12px; border-radius: 4px; font-family: monospace; color: #e83e8c; border: 1px solid #e9ecef;">$1</code>');
    
    // Separators (---)
    text = text.replace(/^---$/gm, '<hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #ddd, transparent); margin: 20px 0;">');
    
    // Quote blocks (> text)
    text = text.replace(/^> (.+)$/gm, '<blockquote style="border-left: 4px solid #667eea; padding-left: 15px; margin: 10px 0; font-style: italic; color: #666; background-color: #f8f9fa; padding: 10px 15px;">$1</blockquote>');
    
    // Feature boxes ([FEATURE: title] content)
    text = text.replace(/\[FEATURE: ([^\]]+)\]\s*(.+?)(?=\n\n|\n\[FEATURE:|$)/gs, 
      '<div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><h4 style="margin: 0 0 10px 0; color: #667eea; font-weight: bold;">$1</h4><p style="margin: 0; color: #555;">$2</p></div>');
    
    // Alert boxes ([ALERT: type] content)
    text = text.replace(/\[ALERT: (success|warning|info|error)\]\s*(.+?)(?=\n\n|\n\[ALERT:|$)/gs, 
      (match, type, content) => {
        const colors = {
          success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
          warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
          info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
          error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
        };
        const color = colors[type] || colors.info;
        return `<div style="background-color: ${color.bg}; border: 1px solid ${color.border}; color: ${color.text}; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${color.border};">${content}</div>`;
      });
    
    return text;
  }

  /**
   * Get formatting help text
   * @returns {string} - Help text with examples
   */
  static getFormattingHelp() {
    return `Formatting Guide - Use these hints to style your email:

HEADERS:
=== Main Title ===     (Large centered header)
== Subtitle ==         (Medium header)
= Section Title =      (Small section header)

TEXT FORMATTING:
**Bold text**          (Bold)
*Italic text*          (Italic)
##Highlighted##        (Yellow highlight)
!!Important!!          (Red important text)

LINKS & BUTTONS:
[Link text](url)       (Regular link)
[BUTTON: Click Me](url) (Styled button)

LISTS:
- List item 1          (Bullet points)
- List item 2

SPECIAL ELEMENTS:
---                    (Horizontal line)
> Quote text           (Quote block)
\`\`\`code\`\`\`         (Code block)

FEATURE BOXES:
[FEATURE: Title]
Your feature description here

ALERT BOXES:
[ALERT: success]
Success message here

[ALERT: warning]
Warning message here

[ALERT: info]
Info message here

[ALERT: error]
Error message here

VARIABLES:
{email}                (User email)
{name}                 (User name)
{company}              (Company name)
{website}              (Main website URL)
{login_url}            (Login page URL)
{unsubscribe_url}      (Unsubscribe page URL)
{support_email}        (Support email address)
{shop_url}             (Products/shop page URL)`;
  }

  /**
   * Get example template
   * @returns {string} - Example template with formatting
   */
  static getExampleTemplate() {
    return `=== Welcome to Our Store! ===

Hi {name},

Thank you for joining our community! We're excited to have you.

= What You Get =

[FEATURE: 🛍️ Product Access]
Browse our wide range of products with exclusive member discounts.

[FEATURE: 💝 Special Offers]
Get early access to sales and member-only deals.

[FEATURE: 📱 Mobile Friendly]
Shop from any device, anywhere, anytime.

= Quick Start Guide =

- **Step 1:** Complete your profile
- **Step 2:** Browse our products
- **Step 3:** Add items to your cart
- **Step 4:** Enjoy secure checkout

[ALERT: info]
Need help? Contact our support team at {support_email} anytime!

[BUTTON: Start Shopping Now]({shop_url})
[BUTTON: Login to Your Account]({login_url})

---
Best regards,
The Store Team

!!Don't forget to check your spam folder if you don't see our emails!!
[Unsubscribe from our emails]({unsubscribe_url})`;
  }
}

export default TextToHtmlConverter;
