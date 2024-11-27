"use client";
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  SkeletonText,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
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
  const [randoms, setRandoms] = React.useState([1, 2, 3]);

  React.useEffect(() => {
    setRandoms(
      Array.from({ length: 3 }, () => Math.floor(Math.random() * 20) + 1)
    );
  }, []);

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
      new Date().getDate() - new Date(localStorageData.timestamp).getDate() >
        CONFIG.daysToKeep
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

  return (
    <Container py={8} px={4} minH="100vh">
      <a href="https://losanios20.substack.com/" target="_blank">
        <Image alt="Los Años 20" src="/static/logo.png" />
      </a>

      <Box position="relative" my={4}>
        <Heading
          textAlign="center"
          as="h1"
          size="xl"
          color="gray.700"
          fontFamily="Creepster"
          style={{
            position: "absolute",
            width: "100%",
            top: "35%",
            backgroundImage: "url('static/texture.jpg')",
            letterSpacing: "0.15em",
          }}
        >
          El Cadaver Exquisito
        </Heading>

        <HStack justifyContent="center" gap={0}>
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[0]}.jpg`}
            w="35%"
          />
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[1]}.jpg`}
            w="35%"
          />
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[2]}.jpg`}
            w="35%"
          />
        </HStack>
      </Box>

      <SkeletonText isLoaded={!isLoading} p={isLoading && 4}>
        <Box
          fontFamily="Almendra"
          fontSize="xl"
          fontWeight="700"
          maxH="38vh"
          p={4}
          overflow="scroll"
          textAlign="justify"
          ref={(el) => {
            // TODO: Fix this is autoscrolling on each redner
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
          userSelect={submitted ? "auto" : "none"}
        >
          {/* TODO: highlight the submitted sentence */}
          {submitted ? (
            <>
              {cadaver.map((sentence, idx) => (
                <Text
                  key={idx}
                  as="span"
                  color={idx % 2 === 0 ? "gray.900" : "gray.600"}
                >
                  {sentence}{" "}
                </Text>
              ))}
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
            fontFamily="Almendra"
            value={currentSentence}
            onChange={(event) => setCurrentSentence(event.target.value)}
            size="lg"
            placeholder="continuá la frase"
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

          {!submitted && (
            <Flex
              my={2}
              width="100%"
              justifyContent="space-between"
              alignItems="center"
              fontFamily="Almendra"
            >
              <CircularProgress
                trackColor="gray.500"
                color="gray.800"
                value={currentSentence.trim().length}
                max={CONFIG.maxCharLimit}
                capIsRound
                mx={1}
              >
                <CircularProgressLabel fontWeight={700} fontSize="lg">
                  {currentSentence.trim().length}
                </CircularProgressLabel>
              </CircularProgress>
              <Button
                size="md"
                variant="outline"
                borderColor="gray.500"
                onClick={submitSentence}
                disabled={!isCurrentSentenceValid}
              >
                Enviar 💀
              </Button>
            </Flex>
          )}
        </>
      )}
    </Container>
  );
}
