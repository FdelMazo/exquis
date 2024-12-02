"use client";
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Container,
  Flex,
  Heading,
  Image,
  SkeletonText,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import { useLocalStorage } from "usehooks-ts";
import { useCadaver } from "./use-cadaver";

const CONFIG = {
  minCharLimit: 20,
  maxCharLimit: 70,
  noOfWords: 5, // Number of words to show both at the beginning and the end of the cadaver
  daysToKeep: 1, // One user sentence per day
};

const destructure = (sentences) => {
  const words = sentences.join(" ").split(" ");
  const n = CONFIG.noOfWords;

  if (n * 2 >= words.length) {
    return { beginning: words.join(" "), middle: [], end: [] };
  }

  const beginning = words.slice(0, n).join(" ");
  const middle = words.slice(n, -n).join(" ");
  const end = words.slice(-n).join(" ");

  return { beginning, middle, end };
};

export default function Page() {
  const { cadaver, isLoading, postSentence } = useCadaver();
  const [submitted, setSubmitted] = React.useState(false);
  const [currentSentence, setCurrentSentence] = React.useState("");

  const [localStorageData, setLocalStorageData] = useLocalStorage(
    "exquis",
    undefined,
    {
      initializeWithValue: false,
    }
  );

  React.useEffect(() => {
    if (
      !localStorageData ||
      new Date() - new Date(localStorageData.timestamp) >
        CONFIG.daysToKeep * 1000 * 60 * 60 * 24
    ) {
      return;
    }

    setSubmitted(true);
    setCurrentSentence(localStorageData.sentence);
  }, [localStorageData]);

  const isCurrentSentenceValid = React.useMemo(() => {
    return (
      currentSentence.trim().length >= CONFIG.minCharLimit &&
      currentSentence.trim().length <= CONFIG.maxCharLimit
    );
  }, [currentSentence]);

  const destructuredCadaver = React.useMemo(() => {
    return destructure(cadaver);
  }, [cadaver]);

  const submitSentence = async () => {
    if (typeof window === "undefined" || !isCurrentSentenceValid) return;
    setSubmitted(true);
    setLocalStorageData({
      timestamp: new Date().toISOString(),
      sentence: currentSentence,
    });
    await postSentence(currentSentence);
  };

  const cadaverRef = React.useRef(null);
  React.useEffect(() => {
    if (cadaverRef.current) {
      cadaverRef.current.scrollTop = cadaverRef.current.scrollHeight;
    }
  }, [cadaver]);

  return (
    <Container py={8} px={4} minH="100vh">
      <style>
        {`@font-face {
            font-family: 'Futura';
            src: url('/static/Futura Medium.ttf') format('truetype');
        }

        @keyframes typing {
              from {
            color: transparent;
          }
          to {
            color: #91191c;
          }
        }`}
      </style>

      {/* TODO: point to https://losanios20.substack.com/ */}
      <a href="http://instagram.com/losanios20" target="_blank">
        <Image alt="Los Años 20" src="/static/logo.png" />
      </a>

      <Box my={4} textAlign="center">
        <Heading
          as="h1"
          size="xl"
          color="gray.700"
          style={{
            fontFamily: "Futura, sans-serif",
          }}
        >
          Cadáver Exquisito
        </Heading>

        <Heading
          size="md"
          color="#91191c"
          style={{
            fontFamily: "Futura, sans-serif",
          }}
        >
          Un texto colectivo de los años 20
        </Heading>
      </Box>

      <SkeletonText isLoaded={!isLoading} p={isLoading && 4}>
        <Box
          fontSize="xl"
          maxH="38vh"
          p={4}
          overflow="scroll"
          style={{
            scrollbarWidth: "none",
            fontFamily: "Times New Roman, sans-serif",
          }}
          textAlign="justify"
          ref={cadaverRef}
          userSelect={submitted ? "auto" : "none"}
        >
          {submitted ? (
            <>
              {cadaver.slice(0, -1).map((sentence, idx) => (
                <Text
                  key={idx}
                  as="span"
                  color={idx % 2 === 0 ? "gray.900" : "gray.600"}
                >
                  {sentence}{" "}
                </Text>
              ))}{" "}
              {cadaver[cadaver.length - 1] &&
                [...cadaver[cadaver.length - 1].split(""), "..."].map(
                  (letter, idx) => (
                    <span
                      key={idx}
                      style={
                        cadaver[cadaver.length - 1] == currentSentence
                          ? {
                              color: "transparent",
                              animation: `typing 1s ${idx / 10}s forwards`,
                            }
                          : {}
                      }
                    >
                      {letter}
                    </span>
                  )
                )}
            </>
          ) : (
            <>
              <Text as="span">{destructuredCadaver.beginning} </Text>
              <Text
                as="span"
                textShadow="0 0 8px rgba(0,0,0,0.5)"
                color="transparent"
              >
                {destructuredCadaver.middle}{" "}
              </Text>
              <Text as="span">{destructuredCadaver.end}...</Text>
            </>
          )}
        </Box>
      </SkeletonText>

      {!isLoading && (
        <>
          <Textarea
            style={{
              fontFamily: "Times New Roman, sans-serif",
            }}
            value={currentSentence}
            onChange={(event) => setCurrentSentence(event.target.value)}
            size="lg"
            placeholder="Continuá la frase que alguien escribió antes que vos"
            isDisabled={submitted}
            my={2}
            autoCapitalize="none"
            focusBorderColor="gray.500"
            bg="gray.50"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitSentence();
              }
            }}
          />

          <Flex
            my={2}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            style={{
              fontFamily: "Times New Roman, sans-serif",
            }}
          >
            {!submitted && (
              <>
                <CircularProgress
                  trackColor="gray.500"
                  color={
                    currentSentence.trim().length < 20 ? "tomato" : "gray.800"
                  }
                  fontWeight="700"
                  value={currentSentence.trim().length}
                  max={CONFIG.maxCharLimit}
                  capIsRound
                  mx={1}
                >
                  <CircularProgressLabel>
                    {currentSentence.trim().length}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="xs">
                  {CONFIG.minCharLimit} {CONFIG.maxCharLimit}
                </Text>
              </>
            )}

            <Flex w="100%" justifyContent="center" gap={2}>
              {/* TODO: encontrar lugar */}
              {/* <a href="https://github.com/FdelMazo/exquis" target="_blank">
                <FaGithub color="#91191c" size={20} />
              </a> */}
              <a href="http://x.com/losanios20" target="_blank">
                <FaTwitter color="#91191c" size={20} />
              </a>
              <a href="http://instagram.com/losanios20" target="_blank">
                <FaInstagram color="#91191c" size={20} />
              </a>
            </Flex>
            {!submitted && (
              <Button
                size="md"
                variant="outline"
                borderColor="gray.500"
                onClick={submitSentence}
                disabled={!isCurrentSentenceValid}
              >
                Enviar 💀
              </Button>
            )}
          </Flex>
        </>
      )}
    </Container>
  );
}
