// Cloudflare Pages Functions 环境类型定义

interface Env {
  AI: {
    autorag: (name: string) => {
      aiSearch: (options: AISearchOptions) => Promise<ReadableStream>;
    };
  };
}

interface AISearchOptions {
  query: string;
  model?: string;
  system_prompt?: string;
  rewrite_query?: boolean;
  max_num_results?: number;
  ranking_options?: {
    score_threshold?: number;
  };
  reranking?: {
    enabled?: boolean;
    model?: string;
  };
  stream?: boolean;
  filters?: Record<string, any>;
}

interface AISearchResult {
  object: "vector_store.search_results.page";
  search_query: string;
  response: string;
  data: AISearchSource[];
}

interface AISearchSource {
  file_id: string;
  filename: string;
  score: number;
  attributes: {
    modified_date?: number;
    folder?: string;
    [key: string]: any;
  };
  content: Array<{
    id: string;
    type: string;
    text: string;
  }>;
}

// 前端期望的响应格式
interface FrontendResponse {
  result: {
    response: string;
    data: AISearchSource[];
  };
}

declare global {
  interface PagesFunction<Env = unknown> {
    (context: {
      request: Request;
      env: Env;
      params: Record<string, string>;
      waitUntil: (promise: Promise<any>) => void;
      next: () => Promise<Response>;
      data: Record<string, any>;
    }): Response | Promise<Response>;
  }
}

export type {
  Env,
  AISearchOptions,
  AISearchResult,
  AISearchSource,
  FrontendResponse,
};
