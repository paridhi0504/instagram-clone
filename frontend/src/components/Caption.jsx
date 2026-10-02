import { Link } from 'react-router-dom';

export default function Caption({ username, text }) {
    const parts = text.split(/(#[\p{L}\p{N}_]+)/gu);

    return (
        <p>
            <strong>{username}</strong>{' '}
            {parts.map((part, i) =>
                /^#[\p{L}\p{N}_]+$/u.test(part) ? (
                    <Link
                        key={i}
                        to={`/tag/${part.slice(1).toLowerCase()}`}
                        className="hashtag"
                    >
                        {part}
                    </Link>
                ) : (
                    part
                )
            )}
        </p>
    );
}