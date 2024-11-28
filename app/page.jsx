"use client";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";
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

  const cadaverRef = React.useRef(null);
  React.useEffect(() => {
    if (cadaverRef.current) {
      cadaverRef.current.scrollTop = cadaverRef.current.scrollHeight;
    }
  }, [cadaver]);

  return (
    <Container py={8} px={4} minH="100vh">
      <style>
        {`@keyframes typing {
                from {
              color: transparent;
            }
            to {
              color: #91191c;
            }
          }`}
      </style>

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
          width="100%"
          position="absolute"
          top="35%"
          backgroundImage="url('static/texture.jpg')"
          letterSpacing={{ base: "0.05em", sm: "0.15em" }}
        >
          El Cadaver Exquisito
        </Heading>

        <HStack justifyContent="center" gap={0}>
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[0]}.jpg`}
            w="33%"
          />
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[1]}.jpg`}
            w="33%"
          />
          <Image
            alt="Cadaver Exquisito"
            src={`static/exquisite-corpse/${randoms[2]}.jpg`}
            w="33%"
          />
        </HStack>
      </Box>

      <Accordion allowToggle border="1px solid" borderColor="gray.400">
        <AccordionItem fontFamily="Almendra" border="none">
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight={700} fontSize="lg">
                Este es un Cadáver Exquisito...
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            <Text fontWeight={700}>
              Un juego de escritura típico de los (otros) años 20, con el que
              los surrealistas buscaban ir más allá del mundo aparente a través
              de los sueños, el inconsciente y el azar.
            </Text>
            <Text fontWeight={700} my={2}>
              Alguien empezaba una frase y otro la seguía. El tercero tenía que
              continuar lo que había escrito el segundo, pero sin leer lo del
              primero. Así se iba formando a ciegas un texto que trascendía los
              mecanismos de la razón.
            </Text>
            <Text fontWeight={700}>
              Escribí una frase que continúe lo que alguien escribió
              inmediatamente antes que vos. Cuando lo hagas se revelará todo lo
              anterior, un texto colectivo de estos años 20.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <SkeletonText isLoaded={!isLoading} p={isLoading && 4}>
        <Box
          fontFamily="Almendra"
          fontSize="xl"
          fontWeight="700"
          maxH="38vh"
          p={4}
          overflow="scroll"
          style={{
            scrollbarWidth: "none",
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

          <Flex
            my={2}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            fontFamily="Almendra"
          >
            {!submitted && (
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
            )}
            <Flex w="100%" justifyContent="center" gap={2}>
              <a href="https://github.com/FdelMazo/exquis" target="_blank">
                <FaGithub color="#91191c" size={20} />
              </a>
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
