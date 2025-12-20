// src/components/gerador/ProgressBar.tsx
export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-700">Gerando lote...</span>
        <span className="text-sm font-medium text-blue-700">{progress}%</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}