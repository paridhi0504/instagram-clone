import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile } from '../api/index.js';

export default function EditProfile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getMe();
        setUsername(user.username || '');
        setBio(user.bio || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSaving(true);

    try {
      await updateProfile({
        username: username.trim(),
        bio,
      });

      setSuccess('Profile updated successfully!');

      setTimeout(async () => {
  try {
    const user = await getMe();
    navigate(`/profile/${user.id}`);
  } catch {
    navigate('/');
  }
}, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="center">Loading profile...</p>;
  }

  return (
    <main className="container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <label>
          Username
          <input
            type="text"
            value={username}
            minLength={3}
            maxLength={50}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label>
          Bio
          <textarea
            value={bio}
            maxLength={300}
            placeholder="Write something about yourself..."
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <p className="muted">{bio.length}/300 characters</p>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}