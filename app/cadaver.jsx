import useSWR from "swr";

const CADAVER_TSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQN9xp7Thv_VMePFXDga_gbpPSrn1hAE0WRzKntDXdYhqBHmQsurUA6wcBjGXxZ6RY4WG0vz77C9zkp/pub?output=tsv";

const cadaverFetcher = async (...args) => {
  const data = await fetch(...args, { cache: "no-store" }).then((res) =>
    res.text()
  );
  const rows = data.split("\n");
  const headers = ["timestamp", "sentence"];

  // TSV to JSON
  const cadaver = rows.slice(1).map((row) => {
    const cells = row.split("\t");
    return headers.reduce((acc, header, i) => {
      acc[header] = cells[i].trim();
      return acc;
    }, {});
  });

  return cadaver
    .sort((a, b) => a["timestamp"] - b["timestamp"])
    .map((row) => row["sentence"]);
};

const postSentence = async (sentence) => {
  const FORM = {
    // https://stackoverflow.com/a/47444396
    SENTENCE_ENTRY: "entry.2078981287",
    URL: "https://docs.google.com/forms/d/e/1FAIpQLSeA-DU53I_gi5_Hz-e_epT6zujVawlakaUg4NPZmTCzSSJvjw/formResponse",
  };

  const formData = new FormData();
  formData.append(FORM.SENTENCE_ENTRY, sentence.trim());
  return fetch(FORM.URL, {
    body: formData,
    method: "POST",
    mode: "no-cors",
  });
};

export const useCadaver = () => {
  const {
    data: cadaver,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(CADAVER_TSV_URL, cadaverFetcher, {
    fallbackData: [],
    refreshInterval: 5000,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });

  const postSentenceAndMutate = async (sentence) => {
    await postSentence(sentence);
    mutate([...cadaver, sentence], {
      revalidate: false,
    });
  };

  return {
    cadaver,
    error,
    isValidating,
    isLoading,
    postSentence: postSentenceAndMutate,
  };
};
