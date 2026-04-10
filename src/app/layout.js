import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
    title: 'StoryForge — AI-Powered Storytelling Platform',
    description: 'Create beautiful illustrated stories with AI. Write, illustrate, and share your stories as interactive digital books.',
    keywords: 'storytelling, AI, writing, books, illustration, creative writing',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>" />
            </head>
            <body className="min-h-screen flex flex-col">
                <ThemeProvider>
                    <AuthProvider>
                        <Navbar />
                        <main className="flex-1 pt-16">
                            {children}
                        </main>
                        <Footer />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
