import { Box, Button, HStack, Heading, VStack } from "@chakra-ui/react";
import Image from "next/image";

export default async function Page() {
  return (
    <Box textAlign="center" fontSize="xl" pt="30vh">
      <VStack gap="8">
        <Image
          alt="chakra logo"
          src="/static/logo.svg"
          width="80"
          height="80"
        />
        <Heading size="2xl" letterSpacing="tight">
          Welcome to Chakra UI v2 + Next.js (App)
        </Heading>

        <HStack>
          <Button>Let's go!</Button>
        </HStack>
      </VStack>
    </Box>
  );
}
