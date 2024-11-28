import useSWR from "swr";

const fetcher = async (url, options) =>
  fetch(url, options).then(async (res) => {
    return (await res.json()).sentences;
  });

export const GET = async (url, options) =>
  fetcher(url, { method: "GET", ...options });
export const POST = async (url, options) =>
  fetcher(url, { method: "POST", ...options });

export const useCadaver = () => {
  const {
    data: cadaver,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR("/api", fetcher, {
    fallbackData: [],
  });

  const postSentence = async (sentence) => {
    await POST("/api", { body: JSON.stringify({ sentence: sentence.trim() }) });
    mutate();
  };

  return {
    cadaver,
    error,
    isValidating,
    isLoading,
    postSentence,
  };
};
