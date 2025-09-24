import React, { useState } from "react";

export default function CodingEditor({ value, onChange, language, setLanguage }) {
  return (
    <div>
      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        className="mb-2 px-2 py-1 border rounded"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>
      <textarea
        className="w-full h-48 border rounded p-2 font-mono"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Write your code here..."
      />
    </div>
  );
}