'use client'

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'; // Import the KaTeX CSS

const MarkdownLaTeXRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownLaTeXRenderer;
