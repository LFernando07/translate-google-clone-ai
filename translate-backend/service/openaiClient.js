import OpenAI from "openai";

// Configurar OpenAI
export const startOpenAI = (OPENAI_API_KEY) => {
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};

export const trainModel = async (client, text, fromLanguage, toLanguage) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI that translates text. You receive a text from the user. Do not answer, just translate the text. The original language is surrounded by `{{` and `}}`. You can also receive {{auto}} which means that you have to detect the language. The language you translate to is surrounded by `[[` and `]]`.",
      },
      {
        role: "user",
        content: "Hola mundo {{Español}} [[English]]",
      },
      {
        role: "assistant",
        content: "Hello world",
      },
      {
        role: "user",
        content: "How are you? {{auto}} [[Deutsch]]",
      },
      {
        role: "assistant",
        content: "Wie geht es dir?",
      },
      {
        role: "user",
        content: "Bon dia, com estas? {{auto}} [[Español]]",
      },
      {
        role: "assistant",
        content: "Buenos días, ¿cómo estás?",
      },
      {
        role: "user",
        content: `${text} {{${fromLanguage}}} [[${toLanguage}]]`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response;
};
