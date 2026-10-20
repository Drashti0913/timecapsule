// Writing ideas shown by the "Need ideas?" button.
const PROMPTS = [
  "What is one thing you're worried about right now that you hope future you laughs at?",
  "Describe a normal day in your life today, from morning to night.",
  "What are three goals you want to reach by the time you read this?",
  "Who are the people you spend the most time with right now?",
  "What song are you listening to on repeat these days?",
  "What's something you're proud of that nobody noticed?",
  "What advice would you give yourself one year ago?",
  "What do you hope has changed by the time you open this?",
  "What do you hope has stayed exactly the same?",
  "Describe the place where you're writing this letter.",
  "What's the best thing that happened to you this month?",
  "What's one habit you're trying to build or break?",
  "If future you could send one message back, what would you want to hear?",
  "What are you looking forward to most right now?",
];

export function randomPrompt(exclude) {
  let prompt;
  do {
    prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  } while (prompt === exclude && PROMPTS.length > 1);
  return prompt;
}
