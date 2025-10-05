import Wheel from "./components/Wheel";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">🎡 Spin the Wheel</h1>
      <Wheel />
    </div>
  );
}

export default App;
