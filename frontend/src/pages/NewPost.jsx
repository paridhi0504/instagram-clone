import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/index.js';

export default function NewPost() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function handleFile(e) {
    setFile(e.target.files[0] || null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setError('Please choose an image');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append('image', file);
      formData.append('caption', caption);

      await createPost(formData);

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container new-post-page">
      <form className="post-form" onSubmit={handleSubmit}>
        <h2>Create new post</h2>

        {error && (
          <p className="error">{error}</p>
        )}

        <label className="file-label">
          Choose an image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
          />
        </label>

        {file && (
          <div className="preview-container">
            <img
              className="preview"
              src={URL.createObjectURL(file)}
              alt="Selected preview"
            />
          </div>
        )}

        <textarea
          placeholder="Write a caption..."
          value={caption}
          maxLength={2200}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="caption-count">
          {caption.length}/2200
        </div>

        <button
          type="submit"
          disabled={busy}
          className="share-btn"
        >
          {busy ? 'Uploading...' : 'Share'}
        </button>
      </form>
    </main>
  );
}