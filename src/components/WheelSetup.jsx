import React, { useState, useEffect } from "react";
import Wheel from "./Wheel";

const DEFAULT_OPTIONS = ["Option 1", "Option 2", "Option 3", "Option 4"];
const DEFAULT_TEXT = DEFAULT_OPTIONS.join("\n");

export default function WheelSetup({ maxOptions = 12 }) {
  const [input, setInput] = useState(DEFAULT_TEXT);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [error, setError] = useState("");

  useEffect(() => {
    // ensure initial options are set from DEFAULT_OPTIONS
    const initial = DEFAULT_OPTIONS.slice();
    setOptions(initial);
  }, []);

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
      setOptions(arr);
      setError("Add at least two options to play.");
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
    setInput(DEFAULT_TEXT);
    setOptions(DEFAULT_OPTIONS);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="w-full max-w-6xl bg-white/80 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Left: Wheel (aligned left) */}
          <div className="md:w-1/2 w-full flex justify-start">
            <div className="w-[320px]">
              {Array.isArray(options) && options.length >= 2 ? (
                <Wheel options={options} />
              ) : (
                <div className="text-red-600">
                  Add at least two options to play.
                </div>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:w-1/2 w-full">
            <label className="block mb-2 font-semibold">
              Options (one per line or comma separated)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              className="w-full p-2 border rounded mb-3"
            />

            <div className="flex gap-2 mb-3">
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

            {error && <div className="text-red-600 mb-2">{error}</div>}

            <div className="text-sm text-gray-600">
              Max {maxOptions} options. Enter at least 2 to show the wheel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
