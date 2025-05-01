interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({ 
  message = 'Loading...', 
  subMessage = 'This may take a few moments' 
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-auto">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <div className="animate-pulse absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-500 rounded-full opacity-25"></div>
          </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
      </div>
    </div>
  );
}