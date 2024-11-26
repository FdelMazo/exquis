"use client";
import {
  Box,
  Button,
  Container,
  Heading,
  Image,
  SkeletonText,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { useLocalStorage } from "react-use";
import { useCadaver } from "./cadaver";

const CONFIG = {
  maxCharLimit: 70,
  minCharLimit: 20,
  lastWords: 5,
  firstSentence: "El cadáver exquisito beberá el vino nuevo",
};

const getLastWords = (lst) => {
  const words = lst.join(" ").split(" ");
  return words.slice(-CONFIG.lastWords).join(" ");
};

export default function Page() {
  // TODO: check there is some flickering
  const { cadaver, isLoading, postSentence } = useCadaver();
  const [localStorageData, setLocalStorageData] = useLocalStorage("exquis", {});

  const { sentence: userSentence } =
    // TODO: Check this is working
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
    setLocalStorageData({
      timestamp: new Date().toISOString(),
      sentence: currentSentence,
    });
    await postSentence(currentSentence);
  };

  return (
    <Container py={8} px={4} minH="100vh">
      <a href="https://losanios20.substack.com/" target="_blank">
        <Image alt="Los Años 20" src="/static/logo.png" />
      </a>
      <Heading
        textAlign="center"
        as="h1"
        size="lg"
        my={4}
        color="gray.700"
        fontWeight="600"
      >
        El Cadaver Exquisito
      </Heading>

      <SkeletonText isLoaded={!isLoading} p={isLoading && 4}>
        <Box
          maxH="60vh"
          p={4}
          overflow="scroll"
          textAlign="justify"
          ref={(el) => {
            // TODO: Fix this is autoscrolling on each redner
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
          fontWeight={"600"}
        >
          <Text as="span">{CONFIG.firstSentence}</Text>{" "}
          {/* TODO: bold or put in black my own sentence in the text */}
          {cadaver
            .join("\t")
            .replace(submitted ? "" : getLastWords(cadaver), "")
            .split("\t")
            .map((sentence, idx) => (
              <Text
                key={idx}
                as="span"
                color={
                  submitted
                    ? idx % 2 === 0
                      ? "gray.600"
                      : "gray.700"
                    : "transparent"
                }
                textShadow={submitted ? "none" : "0 0 5px rgba(0,0,0,0.5)"}
                userSelect={submitted ? "auto" : "none"}
              >
                {sentence}{" "}
              </Text>
            ))}
          {!submitted && (
            <Text as="span">
              {getLastWords(cadaver)}
              ...
            </Text>
          )}
        </Box>
      </SkeletonText>

      <>
        <Textarea
          onChange={(event) => setCurrentSentence(event.target.value)}
          size="lg"
          value={currentSentence}
          placeholder="continuá la frase"
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

        {/* TODO: put this on the text area, on the button, or in a circled progress */}
        <Text
          w="100%"
          textAlign="right"
          fontSize="sm"
          color={isCurrentSentenceValid ? "gray.800" : "tomato"}
          fontWeight="700"
        >
          {currentSentence.length}/{CONFIG.maxCharLimit}
        </Text>
      </>
    </Container>
  );
}
