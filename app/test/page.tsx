export default function TestPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="text-gray-600">
        This is a test page to demonstrate the navigation functionality in PromptPing.de.
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">Navigation Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Responsive navigation bar</li>
          <li>Active link highlighting</li>
          <li>Smooth transitions</li>
          <li>Mobile-friendly design</li>
        </ul>
      </div>
    </div>
  );
}