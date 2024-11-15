"use client";
import {
  Box,
  Button,
  Container,
  SkeletonText,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { useCadaver } from "./cadaver";

const CONFIG = {
  maxCharLimit: 70,
  minCharLimit: 20,
  lastWords: 3,
  firstSentence: "El cadáver exquisito beberá el vino nuevo",
};

const getLastWords = (lst) => {
  const words = lst.join(" ").split(" ");
  return words.slice(-CONFIG.lastWords).join(" ");
};

export default function Page() {
  const { cadaver, isLoading, postSentence } = useCadaver();

  const localStorageData =
    typeof window !== "undefined" &&
    window.localStorage.getItem("cadaver-exquisito") &&
    JSON.parse(window.localStorage.getItem("cadaver-exquisito"));

  const { sentence: userSentence } =
    new Date().getDate() - new Date(localStorageData?.timestamp).getDate() <=
      1 && localStorageData;

  const [submitted, setSubmitted] = React.useState(!!userSentence);
  const [currentSentence, setCurrentSentence] = React.useState(
    userSentence || ""
  );

  const isCurrentSentenceValid = React.useMemo(() => {
    return (
      currentSentence.length >= CONFIG.minCharLimit &&
      currentSentence.length <= CONFIG.maxCharLimit
    );
  }, [currentSentence]);

  const submitSentence = async () => {
    if (!isCurrentSentenceValid || typeof window === "undefined") return;
    setSubmitted(true);
    window.localStorage.setItem(
      "cadaver-exquisito",
      JSON.stringify({
        timestamp: new Date().toISOString(),
        sentence: currentSentence,
      })
    );
    await postSentence(currentSentence);
  };

  return (
    <Container py={12} px={4} my={4}>
      <SkeletonText isLoaded={!isLoading} p={isLoading && 4}>
        <Box
          maxH="400px"
          p={4}
          overflow="scroll"
          textAlign="justify"
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          <Text as="span">{CONFIG.firstSentence}</Text>{" "}
          {cadaver
            .join("\t")
            .replace(getLastWords(cadaver), "")
            .split("\t")
            .map((sentence, idx) => (
              <Text
                key={idx}
                as="span"
                color={
                  submitted
                    ? idx % 2 === 0
                      ? "darkgray"
                      : "dimgray"
                    : "transparent"
                }
                textShadow={submitted ? "none" : "0 0 5px rgba(0,0,0,0.5)"}
                userSelect={submitted ? "auto" : "none"}
              >
                {sentence}{" "}
              </Text>
            ))}
          <Text as="span">
            {getLastWords(cadaver)}
            {/* In case the cadaver didn't load the last entry correctly, we manually append our sentence */}
            {submitted &&
              !cadaver.includes(currentSentence) &&
              ` ${currentSentence}`}
            ...
          </Text>
        </Box>
      </SkeletonText>

      <>
        <Textarea
          onChange={(event) => setCurrentSentence(event.target.value)}
          size="lg"
          value={currentSentence}
          placeholder="..."
          isDisabled={submitted}
          my={2}
          autoCapitalize="none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitSentence();
            }
          }}
        />

        {!submitted && (
          <Box w="100%" textAlign="right">
            <Button onClick={submitSentence} disabled={!isCurrentSentenceValid}>
              Enviar 💀
            </Button>
          </Box>
        )}

        <Text
          w="100%"
          textAlign="right"
          fontSize="sm"
          color={isCurrentSentenceValid ? "gray" : "tomato"}
        >
          {currentSentence.length}/{CONFIG.maxCharLimit}
        </Text>
      </>
    </Container>
  );
}
