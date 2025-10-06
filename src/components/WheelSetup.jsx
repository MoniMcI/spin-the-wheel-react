import { useState } from "react";
import Wheel from "./Wheel";

export default function WheelSetup({ maxOptions = 12 }) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(null); // null means not rendered yet
  const [error, setError] = useState("");

  const parseInput = (text) => {
    // split by comma or newline
    const parts = text
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts;
  };

  const handleUpdate = () => {
    setError("");
    const arr = parseInput(input);
    if (arr.length < 2) {
      setOptions(null);
      setError("Please add at least two options.");
      return;
    }
    if (arr.length > maxOptions) {
      setOptions(arr.slice(0, maxOptions));
      setError(
        `Maximum ${maxOptions} options allowed — using first ${maxOptions}.`
      );
      return;
    }
    setOptions(arr);
  };

  const handleReset = () => {
    setInput("");
    setOptions(null);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <label className="block mb-2 font-semibold">
        Enter options (comma or newline separated)
      </label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full p-2 border rounded mb-2"
        placeholder="Prize 1, Prize 2, Prize 3"
      />
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleUpdate}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Update Wheel
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reset
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {options ? (
        <Wheel options={options} />
      ) : (
        <div className="text-gray-600">
          Enter at least two options and click "Update Wheel".
        </div>
      )}
    </div>
  );
}
