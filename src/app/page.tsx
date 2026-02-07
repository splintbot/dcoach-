export default function Home() {
  return (
    <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-6">
      
      <div className="max-w-2xl w-full border border-green-900 bg-gray-900/50 p-8 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        
        {/* Header / Logo Area */}
        <div className="border-b border-green-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter">
              DCoach<span className="text-red-600">.ai</span>
            </h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest">
              Agentic Trading Tutor
            </p>
          </div>
          <div className="text-xs text-right space-y-1">
            <p>SYSTEM: <span className="text-green-400 animate-pulse">ONLINE</span></p>
            <p>VER: 0.9.1 (BETA)</p>
          </div>
        </div>

        {/* Main Description */}
        <div className="space-y-6">
          <p className="text-xl text-gray-200 leading-relaxed">
            The AI that explains your trades better than you understand them yourself.
          </p>
          
          <div className="bg-black p-4 rounded border border-green-900/50 text-sm space-y-2">
            <p className="flex gap-2">
              <span className="text-gray-500">[INFO]</span>
              <span>Analyzing market context...</span>
            </p>
            <p className="flex gap-2">
              <span className="text-gray-500">[INFO]</span>
              <span>Connecting to Deriv WebSocket...</span>
            </p>
            <p className="flex gap-2">
              <span className="text-gray-500">[INFO]</span>
              <span>Loading User Trade History...</span>
            </p>
            <p className="flex gap-2 text-white">
              <span className="text-red-500">[ACTION]</span>
              <span className="animate-pulse">Preparing Coaching Session...</span>
            </p>
          </div>

          <div className="pt-4 text-center">
            <span className="inline-block bg-red-600 text-white px-6 py-2 rounded font-bold text-sm tracking-wide">
              COMING SOON • DERIV AI SPRINT
            </span>
          </div>
        </div>

      </div>

      <footer className="mt-12 text-gray-600 text-xs">
        <p>POWERED BY DERIV API • GerminiAI • NEXT.JS</p>
      </footer>

    </main>
  );
}