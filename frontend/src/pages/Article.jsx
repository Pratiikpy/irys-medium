import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import apiService from '../services/api';
import { useWallet } from '../components/Common/WalletConnect';
import CommentSection from '../components/Comments/CommentSection';
import TipButton from '../components/Monetization/TipButton';
import NFTMintModal from '../components/NFT/NFTMintModal';
import PaidContentModal from '../components/Monetization/PaidContentModal';

const ShareButtons = ({ article }) => {
  const currentUrl = window.location.href;
  const title = encodeURIComponent(article.title);
  const text = encodeURIComponent(`Check out this article: "${article.title}"`);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${currentUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
    reddit: `https://reddit.com/submit?url=${currentUrl}&title=${title}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-400 text-sm font-medium">Share:</span>
      
      {/* Social Media Buttons */}
      <div className="flex items-center space-x-3">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
          title="Share on Twitter"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </a>
        
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
          title="Share on Facebook"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-700 transition-colors duration-200"
          title="Share on LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        
        <a
          href={shareUrls.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
          title="Share on Reddit"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        </a>

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-green-400 transition-colors duration-200"
          title="Copy link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Article = () => {
  const { id } = useParams();
  const { isConnected, walletAddress } = useWallet();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showPaidContentModal, setShowPaidContentModal] = useState(false);
  const [nftData, setNftData] = useState(null);
  const [paidContentData, setPaidContentData] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getArticle(id);
        setArticle(data);
        
        // Update view count (fire and forget)
        if (data.author_wallet) {
          apiService.incrementArticleCount(data.author_wallet).catch(console.error);
        }

        // Check for NFT data
        try {
          const nft = await apiService.getNFTByArticle(id);
          setNftData(nft);
        } catch (err) {
          // NFT doesn't exist yet
        }

        // Check for paid content
        try {
          const paidContent = await apiService.getPaidContent(id);
          setPaidContentData(paidContent);
        } catch (err) {
          // No paid content
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Article not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-3/4 mb-6"></div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Author Info */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {article.author_name?.charAt(0) || article.author_wallet?.charAt(2) || '?'}
                </span>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {article.author_name || formatAddress(article.author_wallet)}
                </div>
                <div className="text-gray-400 text-sm">
                  Published on {formatDate(article.published_at)}
                </div>
              </div>
            </div>
            
            {/* Article Stats */}
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <div className="flex items-center space-x-1">
                <span>📖</span>
                <span>{article.reading_time} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🔗</span>
                <span className="text-green-400">Permanent</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Irys Storage Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">⛓️</span>
                <span className="text-gray-300">Permanently stored on Irys blockchain</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Category: <span className="text-white">{article.category}</span>
                </span>
                {article.irys_id && (
                  <a
                    href={article.irys_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-mono text-xs"
                    title="View on Irys gateway"
                  >
                    {article.irys_id.slice(0, 8)}...
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.html }}
          style={{
            '--tw-prose-body': 'rgb(229 231 235)',
            '--tw-prose-headings': 'rgb(255 255 255)',
            '--tw-prose-links': 'rgb(99 102 241)',
            '--tw-prose-bold': 'rgb(255 255 255)',
            '--tw-prose-code': 'rgb(156 163 175)',
            '--tw-prose-pre-code': 'rgb(229 231 235)',
            '--tw-prose-pre-bg': 'rgb(31 41 55)',
            '--tw-prose-quotes': 'rgb(156 163 175)',
            '--tw-prose-quote-borders': 'rgb(75 85 99)',
          }}
        />

        {/* Article Footer */}
        <footer className="border-t border-gray-800 pt-8">
          
          {/* Share Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <ShareButtons article={article} />
            
            {/* Word Count */}
            <div className="text-gray-400 text-sm">
              {article.word_count} words
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <TipButton 
              targetWallet={article.author_wallet}
              articleId={article.id}
              authorName={article.author_name}
            />
            
            {/* NFT Button */}
            {nftData ? (
              <a
                href={`/nft-marketplace`}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>View NFT</span>
              </a>
            ) : isConnected && walletAddress === article.author_wallet && (
              <button
                onClick={() => setShowNFTModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>Mint as NFT</span>
              </button>
            )}

            {/* Paid Content Button */}
            {paidContentData && (
              <button
                onClick={() => setShowPaidContentModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🔒</span>
                <span>Purchase ({paidContentData.price} ETH)</span>
              </button>
            )}
          </div>

          {/* Author Profile Link */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {article.author_name?.charAt(0) || article.author_wallet?.charAt(2) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">
                  {article.author_name || 'Anonymous Author'}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Wallet: <span className="font-mono">{formatAddress(article.author_wallet)}</span>
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <Link
                    to={`/author/${article.author_wallet}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    View Profile →
                  </Link>
                  <Link
                    to={`/?author=${article.author_wallet}`}
                    className="text-gray-400 hover:text-white"
                  >
                    More Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              ← Back to Articles
            </Link>
          </div>

        </footer>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection articleId={article.id} />
        </div>
      </article>

      {/* NFT Mint Modal */}
      <NFTMintModal
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        articleId={article?.id}
        articleTitle={article?.title}
        onMintSuccess={(nft) => {
          setNftData(nft);
          setShowNFTModal(false);
        }}
      />

      {/* Paid Content Modal */}
      <PaidContentModal
        isOpen={showPaidContentModal}
        onClose={() => setShowPaidContentModal(false)}
        articleId={article?.id}
        articleTitle={article?.title}
        price={paidContentData?.price}
        currency={paidContentData?.currency}
        onPurchaseSuccess={() => {
          setShowPaidContentModal(false);
          // Refresh article to show full content
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Article;