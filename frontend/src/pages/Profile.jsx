import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { getProfile, getUserPosts, followUser, unfollowUser } from '../api/index.js';
import { mediaUrl } from '../api/client.js';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const [p, postData] = await Promise.all([
          getProfile(id),
          getUserPosts(id),
        ]);

        if (cancelled) return;

        setProfile(p);
        setPosts(postData.posts);
        setNextCursor(postData.nextCursor);
        setError('');
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleFollow() {
    try {
      if (profile.is_following) {
        await unfollowUser(profile.id);
        setProfile({
          ...profile,
          is_following: false,
          follower_count: profile.follower_count - 1,
        });
      } else {
        await followUser(profile.id);
        setProfile({
          ...profile,
          is_following: true,
          follower_count: profile.follower_count + 1,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMore() {
    const data = await getUserPosts(id, nextCursor);
    setPosts((prev) => [...prev, ...data.posts]);
    setNextCursor(data.nextCursor);
  }

  if (error) return <p className="error center">{error}</p>;
  if (!profile) return <p className="center">Loading...</p>;

  const isMe = user.id === profile.id;

  return (
    <div className="container">
      <header className="profile-header">
        <h2>{profile.username}</h2>
        <p>
          <strong>{profile.post_count}</strong> posts ·{' '}
          <strong>{profile.follower_count}</strong> followers ·{' '}
          <strong>{profile.following_count}</strong> following
        </p>

        {!isMe && (
          <button onClick={toggleFollow}>
            {profile.is_following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </header>

      <div className="grid">
        {posts.map((p) => (
          <img
            key={p.id}
            src={mediaUrl(p.media_url)}
            alt={p.caption || 'post'}
          />
        ))}
      </div>

      {nextCursor && (
        <button className="load-more" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
