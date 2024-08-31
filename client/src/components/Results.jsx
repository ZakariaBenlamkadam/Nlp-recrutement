import React from 'react';

function Results({ results, error }) {
  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Results:</h2>
      {results.length > 0 && (
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              CV ID: {result.cv_id}, Similarity: {result.similarity_cosine}, Text: {result.cv_text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Results;
