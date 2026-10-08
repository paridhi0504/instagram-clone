import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPost } from '../api/index.js';
import PostCard from '../components/PostCard.jsx';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getPost(id);
        setPost(data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadPost();
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  if (!post) {
    return <p className="center">Loading...</p>;
  }

  return (
    <main className="container post-detail-page">
      <Link to="/" className="back-link">
        ← Back
      </Link>

      <PostCard post={post} />
    </main>
  );
}