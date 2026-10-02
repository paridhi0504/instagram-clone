import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import {
  getProfile,
  getUserPosts,
  followUser,
  unfollowUser
} from '../api/index.js';
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
    try {
      const data = await getUserPosts(id, nextCursor);

      setPosts((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <p className="error center">{error}</p>;
  }

  if (!profile) {
    return <p className="center">Loading...</p>;
  }

  const isMe = user.id === profile.id;

  return (
    <main className="container profile-page">
      <section className="profile-header">
        <div className="profile-avatar">
          {profile.username.charAt(0).toUpperCase()}
        </div>

        <div className="profile-info">
          <div className="profile-title">
            <h2>{profile.username}</h2>

            {!isMe && (
              <button
                className={
                  profile.is_following
                    ? 'follow-btn following'
                    : 'follow-btn'
                }
                onClick={toggleFollow}
              >
                {profile.is_following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <span>
              <strong>{profile.post_count}</strong> posts
            </span>

            <span>
              <strong>{profile.follower_count}</strong> followers
            </span>

            <span>
              <strong>{profile.following_count}</strong> following
            </span>
          </div>
        </div>
      </section>

      <section className="profile-posts">
        <h3>Posts</h3>

        {posts.length === 0 ? (
          <p className="center muted">
            No posts yet.
          </p>
        ) : (
          <div className="grid">
            {posts.map((post) => (
              <img
                key={post.id}
                src={mediaUrl(post.media_url)}
                alt={post.caption || 'post'}
              />
            ))}
          </div>
        )}
      </section>

      {nextCursor && (
        <button
          className="load-more"
          onClick={loadMore}
        >
          Load more
        </button>
      )}
    </main>
  );
}