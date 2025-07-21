import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const CommentSection = ({ articleId }) => {
  const { isConnected, walletAddress } = useWallet();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isConnected) return;

    setPosting(true);
    try {
      const commentData = {
        article_id: articleId,
        author_wallet: walletAddress,
        content: newComment.trim()
      };
      
      const createdComment = await apiService.createComment(commentData);
      setComments(prev => [createdComment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'Anonymous';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      {/* Comments Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Comments ({comments.length})
          </h3>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showComments ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {showComments && (
        <>
          {/* Comment Input */}
          <div className="p-6 border-b border-gray-700">
            {isConnected ? (
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    {newComment.length}/1000 characters
                  </div>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || posting}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    {posting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">
                  Connect your wallet to join the discussion
                </p>
                <div className="text-sm text-gray-500">
                  🔐 Decentralized comments • ⛓️ Permanent storage
                </div>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-400 text-lg">No comments yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {comment.author_name?.charAt(0) || comment.author_wallet?.charAt(2) || '?'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-gray-300 font-medium">
                            {comment.author_name || formatAddress(comment.author_wallet)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-gray-200 leading-relaxed">
                          {comment.content}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                            👍 Like
                          </button>
                          <button className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                            💬 Reply
                          </button>
                          <button className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                            🔗 Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentSection;