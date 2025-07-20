import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/Editor/RichTextEditor';
import { useWallet } from '../components/Common/WalletConnect';
import irysService from '../services/irys';
import apiService from '../services/api';

const Write = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, balance } = useWallet();

  const [article, setArticle] = useState({
    title: '',
    content: '',
    html: '',
    excerpt: '',
    category: 'Technology',
    tags: []
  });

  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [uploadPrice, setUploadPrice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Calculate upload price when content changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (article.title && article.html && isConnected) {
        try {
          const articleData = {
            ...article,
            author: walletAddress,
            publishedAt: Date.now()
          };
          const priceData = await irysService.getUploadPrice(articleData);
          setUploadPrice(priceData);
        } catch (error) {
          console.error('Error calculating price:', error);
        }
      }
    };

    const debounceTimer = setTimeout(calculatePrice, 1000);
    return () => clearTimeout(debounceTimer);
  }, [article.title, article.html, walletAddress, isConnected]);

  const handleEditorChange = ({ html, text, isEmpty }) => {
    setArticle(prev => ({
      ...prev,
      content: text,
      html: html,
      excerpt: prev.excerpt || createExcerpt(text)
    }));
  };

  const createExcerpt = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    const excerpt = text.substring(0, maxLength);
    const lastSpace = excerpt.lastIndexOf(' ');
    return (lastSpace > 0 ? excerpt.substring(0, lastSpace) : excerpt) + '...';
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateArticle = () => {
    const errors = [];
    
    if (!article.title.trim()) errors.push('Title is required');
    if (!article.html.trim() || article.html === '<p></p>') errors.push('Content is required');
    if (article.title.length > 200) errors.push('Title must be under 200 characters');
    if (article.html.length > 100000) errors.push('Content is too long (max 100,000 characters)');
    
    return errors;
  };

  const publishArticle = async () => {
    const errors = validateArticle();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    // Check balance
    const balanceNum = parseFloat(balance);
    const priceNum = parseFloat(uploadPrice?.price || '0');
    
    if (balanceNum < priceNum) {
      alert(`Insufficient balance. You need ${priceNum} ETH but only have ${balanceNum} ETH. Please fund your Irys node.`);
      return;
    }

    setIsPublishing(true);
    
    try {
      // Step 1: Create article in database
      setPublishStep('Creating article metadata...');
      const articleData = {
        title: article.title,
        content: article.content,
        html: article.html,
        excerpt: article.excerpt,
        author_wallet: walletAddress,
        tags: article.tags,
        category: article.category
      };

      const createdArticle = await apiService.createArticle(articleData);
      console.log('✅ Article metadata created:', createdArticle.id);

      // Step 2: Upload to Irys
      setPublishStep('Uploading to Irys blockchain...');
      const irysResult = await irysService.uploadArticle({
        ...articleData,
        id: createdArticle.id
      });

      console.log('✅ Article uploaded to Irys:', irysResult.id);

      // Step 3: Update article with Irys ID
      setPublishStep('Finalizing publication...');
      await apiService.updateArticleIrysId(
        createdArticle.id, 
        irysResult.id, 
        irysResult.url
      );

      // Step 4: Update author stats
      await apiService.incrementArticleCount(walletAddress);

      console.log('✅ Article published successfully!');
      
      // Redirect to article page
      navigate(`/article/${createdArticle.id}`);

    } catch (error) {
      console.error('Publishing failed:', error);
      alert(`Publishing failed: ${error.message}`);
    } finally {
      setIsPublishing(false);
      setPublishStep('');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
          <p className="text-gray-400">Please connect your wallet to write articles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Write Article</h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={publishArticle}
              disabled={isPublishing || !article.title.trim() || !article.html.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {isPublishing ? 'Publishing...' : 'Publish to Irys'}
            </button>
          </div>
        </div>

        {/* Publishing Progress */}
        {isPublishing && (
          <div className="bg-indigo-900 border border-indigo-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-indigo-200">{publishStep}</span>
            </div>
            <div className="mt-2 text-indigo-300 text-sm">
              Please don't close this page while publishing...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {!showPreview ? (
              <>
                {/* Title Input */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Article title..."
                    value={article.title}
                    onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-4xl font-bold bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none"
                    maxLength={200}
                  />
                  <div className="text-gray-500 text-sm mt-2">
                    {article.title.length}/200 characters
                  </div>
                </div>

                {/* Rich Text Editor */}
                <RichTextEditor
                  content={article.html}
                  onChange={handleEditorChange}
                  placeholder="Tell your story..."
                />
              </>
            ) : (
              /* Preview Mode */
              <div className="bg-gray-800 rounded-lg p-8">
                <h1 className="text-4xl font-bold text-white mb-6">{article.title || 'Untitled'}</h1>
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Publication Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Publication</h3>
              
              {/* Category */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={article.category}
                  onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={handleTagAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
                
                {/* Tag List */}
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-gray-400 hover:text-red-400 ml-2"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Excerpt
                </label>
                <textarea
                  placeholder="Brief description..."
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="text-gray-500 text-xs mt-1">
                  {article.excerpt.length}/300 characters
                </div>
              </div>
            </div>

            {/* Storage Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Storage Cost</h3>
              
              {uploadPrice ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{uploadPrice.size} bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-green-400 font-mono">{uploadPrice.price} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className={`font-mono ${parseFloat(balance) >= parseFloat(uploadPrice.price) ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(balance).toFixed(6)} ETH
                      </span>
                    </div>
                  </div>
                  
                  {parseFloat(balance) < parseFloat(uploadPrice.price) && (
                    <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
                      <div className="text-red-400 text-sm">
                        ⚠️ Insufficient balance. Please fund your Irys node.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-sm">
                  Add title and content to calculate storage cost
                </div>
              )}

              <div className="mt-4 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                <div className="text-green-400 text-xs">
                  ⛓️ Stored permanently on Irys blockchain
                </div>
              </div>
            </div>

            {/* Article Stats */}
            {(article.content || article.title) && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Words:</span>
                    <span className="text-white">{article.content.split(' ').filter(w => w).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Characters:</span>
                    <span className="text-white">{article.content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reading time:</span>
                    <span className="text-white">
                      {Math.max(1, Math.ceil(article.content.split(' ').filter(w => w).length / 200))} min
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;