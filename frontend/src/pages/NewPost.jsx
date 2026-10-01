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
    if (!file) return setError('Please choose an image');

    setBusy(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);      // must match upload.single('image')
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
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>New post</h2>
      {error && <p className="error">{error}</p>}

      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />

      {file && (
        <img className="preview" src={URL.createObjectURL(file)} alt="preview" />
      )}

      <textarea
        placeholder="Write a caption..." value={caption} maxLength={2200}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button disabled={busy}>{busy ? 'Uploading...' : 'Share'}</button>
    </form>
  );
}