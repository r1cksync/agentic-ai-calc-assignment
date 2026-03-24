'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const suggestedPrompts = [
  { text: 'Plot sin(x) vs cos(x)', icon: '📈' },
  { text: 'Solve x² - 5x + 6 = 0', icon: '🧮' },
  { text: 'What is the determinant of [[1,2],[3,4]]?', icon: '🔢' },
  { text: 'Convert 100 joules to eV', icon: '⚡' },
  { text: 'Graph a 3D saddle surface', icon: '🌊' },
  { text: 'Compare parabola and hyperbola', icon: '📊' },
];

const features = [
  { title: 'AI Calculator', desc: 'Evaluate complex expressions with step-by-step solutions', icon: '🧮' },
  { title: 'Equation Solver', desc: 'Solve equations algebraically with detailed working', icon: '📐' },
  { title: '2D & 3D Graphs', desc: 'Plot functions in Cartesian, polar, and 3D coordinate systems', icon: '📈' },
  { title: 'Unit Converter', desc: 'Convert between SI, imperial, energy, temperature, and more', icon: '🔄' },
  { title: 'Matrix Operations', desc: 'Determinant, inverse, eigenvalues, multiplication, and more', icon: '🔢' },
  { title: 'Analytics Dashboard', desc: 'Track your math queries and computation patterns', icon: '📊' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-lg">π</div>
            <span className="font-bold text-lg">AI Math Agent</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Chat
            </Link>
            <Link href="/analytics" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/notebook" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Notebook
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent"
          >
            AI Math Agent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Your intelligent math companion. Calculate, plot, solve equations, convert units, and explore
            mathematics with the power of AI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/chat"
              className="px-8 py-3 bg-primary rounded-xl text-lg font-medium hover:bg-primary/80 transition-all hover:scale-105"
            >
              Start Chatting
            </Link>
            <Link
              href="/notebook"
              className="px-8 py-3 bg-surface-light rounded-xl text-lg font-medium hover:bg-surface transition-all hover:scale-105 border border-white/10"
            >
              Open Notebook
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Suggested Prompts */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 mb-6 text-sm font-medium uppercase tracking-wider"
          >
            Try these prompts
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedPrompts.map((prompt, i) => (
              <motion.div
                key={prompt.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <Link
                  href={`/chat?q=${encodeURIComponent(prompt.text)}`}
                  className="block p-4 bg-surface rounded-xl border border-white/5 hover:border-primary/50 transition-all hover:scale-[1.02] group"
                >
                  <span className="text-2xl mr-3">{prompt.icon}</span>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{prompt.text}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Powerful Math Tools
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-surface rounded-2xl border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-500 text-sm">
        AI Math Agent — Powered by Groq LLaMA 3.3, Plotly, and Next.js
      </footer>
    </main>
  );
}
