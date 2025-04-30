🚀 AI Chat Assistant – Powered by AIMLAPI & React
An AI-powered chat assistant built using React and TypeScript, integrated with AIMLAPI (OpenAI-compatible API). This project brings conversational AI to the browser with a clean, modern UI built with Material-UI.

🧠 About the Project
This project demonstrates how to build a real-time AI assistant using:

- React with TypeScript for type-safe development
- Material-UI for modern, responsive UI components
- AIMLAPI for AI chat completions (GPT-3.5/GPT-4)
- Cashfree for payment processing
- Create React App for development and building

Whether you're creating a chatbot, virtual assistant, or AI help desk, this template gives you a solid foundation.

🔧 Getting Started

1. Clone the Repository

```bash
git clone https://github.com/karancodex/AI-Chat-Assistant-Open-AI.git
cd AI-Chat-Assistant-Open-AI
```

2. Install Dependencies

```bash
npm install
```

3. Configure Environment Variables
   Create a `.env` file at the root:

```env
REACT_APP_AIML_API_KEY=your_aimlapi_key_here
REACT_APP_CASHFREE_MODE=sandbox
REACT_APP_CASHFREE_PAYMENT_SESSION_ID=your_payment_session_id
```

🔐 Keep your API keys secret and never expose them in frontend code.

4. Run the App

```bash
npm start
```

Open http://localhost:3000 to view it in your browser.

🛠 Project Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm start`     | Runs the app in development mode |
| `npm run build` | Builds the app for production    |
| `npm test`      | Runs the test suite              |
| `npm run eject` | Ejects from Create React App     |

✨ Features

- Real-time chat interface with message history
- AIMLAPI integration for AI responses
- Material-UI based modern and responsive UI
- Payment integration with Cashfree
- Loading states and error handling
- Type-safe development with TypeScript

🌐 API Integration
The application integrates with AIMLAPI for chat completions:

```http
POST https://api.aimlapi.com/v1/chat/completions
Headers:
  Authorization: Bearer <AIML_API_KEY>
  Content-Type: application/json

Request body:
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
```

💡 How to Contribute
We welcome all contributions!

1. Fork the repository
2. Create a new branch:

```bash
git checkout -b feature/my-feature
```

3. Commit your changes:

```bash
git commit -m "Add: new feature"
```

4. Push and open a pull request

Please follow the existing code style and naming conventions.

📚 Learn More

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [AIMLAPI Docs](https://docs.aimlapi.com/)
- [Cashfree Documentation](https://docs.cashfree.com/docs)

🌟 Show Your Support
If you like this project, give it a ⭐️ on GitHub and share it with your network!
