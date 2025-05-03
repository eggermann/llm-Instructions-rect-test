import Link from 'next/link';
import { headers } from 'next/headers';

export function Navigation() {
  const pathname = headers().get('x-pathname') || '/';

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link 
            href="/" 
            className={`text-lg font-semibold hover:text-gray-300 ${
              pathname === '/' ? 'text-blue-400' : ''
            }`}
          >
            PromptPing.de
          </Link>
          <div className="ml-8 flex space-x-4">
            <Link
              href="/test"
              className={`hover:text-gray-300 ${
                pathname === '/test' ? 'text-blue-400' : ''
              }`}
            >
              Test
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}