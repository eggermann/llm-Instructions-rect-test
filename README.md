# Dynamic Widget Generator

A Next.js application that leverages OpenAI's GPT models to generate responsive, visually appealing widgets from natural language prompts. The system automatically creates optimized HTML, CSS, and JavaScript code with a focus on accessibility, readability, and performance.

## Features

- 🎨 **Dynamic Widget Generation**
  - Natural language to widget conversion
  - Automatic theme generation
  - Optimized text readability with backdrop blur and contrast
  - Responsive design for all screen sizes
  - Scoped CSS to prevent style conflicts

- 🖼️ **AI-Powered Image Generation**
  - DALL-E integration for background images
  - Context-aware image creation
  - Dynamic image placement optimization
  - Automatic alt text generation

## Technical Architecture

### Core Components

#### DynamicRect Component
The central widget renderer that handles:
- Intersection Observer setup for performance optimization
- Scoped CSS injection with unique identifiers
- Isolated JavaScript execution in controlled context
- Memory management and cleanup
- Event listener lifecycle management
- Dynamic content updates
- Error boundary implementation

#### Widget Container
Provides the user interface with:
- Three distinct modes (Preview/Code/Edit)
- Live code editing capabilities
- Syntax highlighting
- Code copying functionality
- Theme management interface
- Responsive layout controls

### Data Flow

```
User Prompt → OpenAI API → Widget Generation → Dynamic Rendering
     ↑                          ↓
     └── Theme Generation ←─ Image Creation
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/eggermann/llm-Instructions-rect-test.git
cd llm-Instructions-rect-test
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
Create a `.env.local` file with:
```env
OPENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
app/
├── api/                    # API routes
│   ├── openai/            # OpenAI API integration
│   └── prompts/           # Prompt management
├── components/            # React components
│   ├── DynamicRect/      # Core widget renderer
│   ├── Widget/           # Widget container
│   ├── LoadingOverlay/   # Loading states
│   └── Navigation/       # App navigation
├── utils/                # Utility functions
│   ├── openai/           # OpenAI integration
│   │   ├── config.ts     # API configuration
│   │   ├── types.ts      # TypeScript definitions
│   │   └── index.ts      # Main integration logic
│   ├── logger.ts         # Logging utilities
│   └── widgetStore.ts    # Widget state management
└── types/                # Global type definitions
```

## Key Technologies

- **Next.js 14**
  - App Router
  - Server Components
  - API Routes
  - Static and Dynamic Rendering

- **React 18**
  - Hooks
  - Context API
  - Suspense
  - Error Boundaries

- **TypeScript**
  - Strict Type Checking
  - Interface Definitions
  - Type Guards
  - Utility Types

- **Tailwind CSS**
  - JIT Compiler
  - Custom Plugins
  - Responsive Utilities
  - Theme Configuration

- **OpenAI Integration**
  - GPT-4 API
  - DALL-E 3
  - Streaming Responses
  - Error Handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for their powerful API
- Next.js team for the framework
- Contributors and maintainers

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
