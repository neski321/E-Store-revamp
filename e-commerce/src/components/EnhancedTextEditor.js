import React, { useState, useEffect } from 'react';
import TextToHtmlConverter from '../services/textToHtmlConverter';

const EnhancedTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter your email content using the formatting guide below...',
  showPreview = true,
  showHelp = true,
  variables = {}
}) => {
  const [text, setText] = useState(value);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const [showHtmlContent, setShowHtmlContent] = useState(false);
  const [showPlainTextPreview, setShowPlainTextPreview] = useState(false);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text) {
      const html = TextToHtmlConverter.convertToHtml(text, variables);
      setHtmlPreview(html);
      if (onChange) {
        onChange(text, html);
      }
    } else {
      setHtmlPreview('');
      if (onChange) {
        onChange('', '');
      }
    }
  }, [text, variables, onChange]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
  };

  const insertFormatting = (format) => {
    const textarea = document.getElementById('enhanced-text-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'highlight':
        newText = `##${selectedText}##`;
        cursorOffset = 2;
        break;
      case 'important':
        newText = `!!${selectedText}!!`;
        cursorOffset = 2;
        break;
      case 'h1':
        newText = `=== ${selectedText} ===`;
        cursorOffset = 4;
        break;
      case 'h2':
        newText = `== ${selectedText} ==`;
        cursorOffset = 3;
        break;
      case 'h3':
        newText = `= ${selectedText} =`;
        cursorOffset = 2;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        cursorOffset = -3;
        break;
      case 'button':
        newText = `[BUTTON: ${selectedText}](url)`;
        cursorOffset = -3;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'feature':
        newText = `[FEATURE: ${selectedText}]\nYour feature description here`;
        cursorOffset = -32;
        break;
      case 'alert':
        newText = `[ALERT: info]\n${selectedText}`;
        cursorOffset = -12;
        break;
      default:
        // No formatting applied for unknown format
        newText = selectedText;
        cursorOffset = 0;
        break;
    }
    
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);
    const finalText = beforeText + newText + afterText;
    
    setText(finalText);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('enhanced-text-editor');
    const start = textarea.selectionStart;
    const beforeText = text.substring(0, start);
    const afterText = text.substring(textarea.selectionEnd);
    const newText = beforeText + `{${variable}}` + afterText;
    
    setText(newText);
    
    setTimeout(() => {
      const newCursorPos = start + variable.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const loadExample = () => {
    setText(TextToHtmlConverter.getExampleTemplate());
  };

  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="bg-gray-50 p-3 rounded-lg border">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700 mr-2">Show/Hide:</span>
          
          <button
            type="button"
            onClick={() => setShowFormattingHelp(!showFormattingHelp)}
            className={`px-3 py-1 text-xs rounded ${
              showFormattingHelp 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300'
            } hover:bg-gray-50`}
          >
            {showFormattingHelp ? 'Hide Help' : 'Show Help'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowPlainTextPreview(!showPlainTextPreview)}
            className={`px-3 py-1 text-xs rounded ${
              showPlainTextPreview 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-white text-gray-700 border border-gray-300'
            } hover:bg-gray-50`}
          >
            {showPlainTextPreview ? 'Hide Plain Text' : 'Show Plain Text'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowHtmlContent(!showHtmlContent)}
            className={`px-3 py-1 text-xs rounded ${
              showHtmlContent 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-white text-gray-700 border border-gray-300'
            } hover:bg-gray-50`}
          >
            {showHtmlContent ? 'Hide HTML' : 'Show HTML'}
          </button>
          
          <button
            type="button"
            onClick={() => setShowHtmlPreview(!showHtmlPreview)}
            className={`px-3 py-1 text-xs rounded ${
              showHtmlPreview 
                ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                : 'bg-white text-gray-700 border border-gray-300'
            } hover:bg-gray-50`}
          >
            {showHtmlPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="bg-gray-50 p-3 rounded-lg border">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700 mr-2">Formatting:</span>
          
          <button
            type="button"
            onClick={() => insertFormatting('bold')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
            title="Bold"
          >
            B
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('italic')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
            title="Italic"
          >
            I
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('highlight')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 bg-yellow-100"
            title="Highlight"
          >
            HL
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('important')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 text-red-600"
            title="Important"
          >
            !
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => insertFormatting('h1')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Large Header"
          >
            H1
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('h2')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Medium Header"
          >
            H2
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('h3')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Small Header"
          >
            H3
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={() => insertFormatting('link')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Link"
          >
            Link
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('button')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 bg-blue-100"
            title="Button"
          >
            Button
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('list')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="List Item"
          >
            List
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('quote')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Quote"
          >
            Quote
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('feature')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Feature Box"
          >
            Feature
          </button>
          
          <button
            type="button"
            onClick={() => insertFormatting('alert')}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Alert Box"
          >
            Alert
          </button>
        </div>
        
        {/* Variables */}
        {Object.keys(variables).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Variables:</span>
            {Object.keys(variables).map(variable => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded hover:bg-blue-200"
                title={`Insert {${variable}}`}
              >
                {`{${variable}}`}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={loadExample}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 border border-green-200 rounded hover:bg-green-200"
          >
            Load Example
          </button>
        </div>
      </div>

      {/* Formatting Help */}
      {showFormattingHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Formatting Guide</h4>
          <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono leading-relaxed">
            {TextToHtmlConverter.getFormattingHelp()}
          </pre>
        </div>
      )}

      {/* Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plain Text Content (with formatting hints)
        </label>
        <textarea
          id="enhanced-text-editor"
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          style={{ lineHeight: '1.6' }}
        />
      </div>

      {/* Plain Text Preview */}
      {showPlainTextPreview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plain Text Preview
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono" style={{ lineHeight: '1.6' }}>
              {text}
            </pre>
          </div>
        </div>
      )}

      {/* HTML Content Display */}
      {showHtmlContent && htmlPreview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated HTML Content
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-gray-900 text-green-400 max-h-48 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {htmlPreview}
            </pre>
          </div>
        </div>
      )}

      {/* HTML Preview */}
      {showHtmlPreview && htmlPreview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTML Preview (how it will look)
          </label>
          <div 
            className="border border-gray-300 rounded-md p-4 bg-white max-h-64 overflow-y-auto"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.6',
              color: '#333'
            }}
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedTextEditor;
