import React, { useState, useEffect } from 'react';
import { useWallet } from '../Common/WalletConnect';
import apiService from '../../services/api';

const CommentItem = ({ comment, onReply, onLike, onDislike, currentUser }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

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

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    setIsReplying(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText('');
      setShowReplies(true);
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const canInteract = currentUser && currentUser !== comment.author_wallet;

  return (
    <div className="border-l-2 border-gray-700 pl-4 mb-4">
      <div className="bg-gray-800 rounded-lg p-4">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {comment.author_name?.charAt(0) || comment.author_wallet?.charAt(2) || '?'}
              </span>
            </div>
            <div>
              <div className="text-gray-300 font-medium text-sm">
                {comment.author_name || formatAddress(comment.author_wallet)}
              </div>
              <div className="text-gray-500 text-xs">
                {formatDate(comment.created_at)}
                {comment.is_edited && <span className="ml-2 text-gray-400">(edited)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="text-gray-300 mb-3 text-sm leading-relaxed">
          {comment.content}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-xs">
          {canInteract && (
            <>
              <button
                onClick={() => onLike(comment.id)}
                className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors"
              >
                <span>👍</span>
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => onDislike(comment.id)}
                className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <span>👎</span>
                <span>{comment.dislikes}</span>
              </button>
            </>
          )}
          
          {canInteract && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Reply
            </button>
          )}
          
          {comment.replies_data && comment.replies_data.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
            >
              {showReplies ? 'Hide' : `Show`} {comment.replies_data.length} replies
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplies && canInteract && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm resize-none"
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowReplies(false)}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={isReplying || !replyText.trim()}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReplying ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && comment.replies_data && comment.replies_data.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies_data.map((reply) => (
              <div key={reply.id} className="bg-gray-750 rounded-lg p-3 ml-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {reply.author_name?.charAt(0) || reply.author_wallet?.charAt(2) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="text-gray-300 font-medium text-xs">
                        {reply.author_name || formatAddress(reply.author_wallet)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">
                  {reply.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ articleId }) => {
  const { isConnected, walletAddress } = useWallet();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      const data = await apiService.getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !isConnected) return;

    setPosting(true);
    try {
      const commentData = {
        content: newComment,
        author_wallet: walletAddress,
        article_id: articleId
      };

      await apiService.createComment(commentData);
      setNewComment('');
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const commentData = {
        content,
        author_wallet: walletAddress,
        article_id: articleId,
        parent_id: parentId
      };

      await apiService.createComment(commentData);
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleLike = async (commentId) => {
    try {
      await apiService.addCommentReaction(commentId, {
        user_wallet: walletAddress,
        reaction_type: 'like'
      });
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async (commentId) => {
    try {
      await apiService.addCommentReaction(commentId, {
        user_wallet: walletAddress,
        reaction_type: 'dislike'
      });
      await loadComments(); // Reload comments
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {isConnected ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none"
            rows="3"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePostComment}
              disabled={posting || !newComment.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-750 rounded-lg text-center">
          <p className="text-gray-400 mb-2">Connect your wallet to comment</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Connect Wallet
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onDislike={handleDislike}
              currentUser={walletAddress}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 