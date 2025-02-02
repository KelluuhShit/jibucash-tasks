const getRandomAmount = () => Math.floor(Math.random() * 20) + 80;

const initialTasks = [
  { id: '1', title: 'Monetizing Social Media', description: 'Showcase strategies to earn money from platforms like Facebook, Instagram, or TikTok.', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 3, category: 'initial' },
  { id: '2', title: 'Affiliate Marketing Basics', description: 'Demonstrate how you can earn commissions by promoting products online.', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 6, category: 'initial' },
  { id: '3', title: 'Avoiding Online Scams', description: 'Highlight ways to identify and prevent financial fraud on social media.', expiry: Date.now() + 24 * 60 * 60 * 1000, amount: 4, category: 'initial' },
];

const personalQuizzesTasks = [
  { id: '1', title: 'Social Skills', description: 'Show your ability to interact with others in different situations.', amount: 80, category: 'personalQuizzes' },
  { id: '2', title: 'Money Management', description: 'Demonstrate how you handle finances responsibly.', amount: 85, category: 'personalQuizzes' },
  { id: '3', title: 'Time Management', description: 'Showcase your efficiency in organizing and prioritizing tasks.', amount: 90, category: 'personalQuizzes' },
  { id: '4', title: 'Risk-Taking Ability', description: 'Express your approach to making bold or calculated decisions.', amount: 88, category: 'personalQuizzes' },
  { id: '5', title: 'Productivity Habits', description: 'Highlight the strategies you use to stay focused and efficient.', amount: 87, category: 'personalQuizzes' },
  { id: '6', title: 'Emotional Intelligence', description: 'Display your awareness and management of emotions in daily life.', amount: 89, category: 'personalQuizzes' },
  { id: '7', title: 'Decision-Making Skills', description: 'Prove your ability to analyze situations and make smart choices.', amount: 86, category: 'personalQuizzes' },
];

const healthWellnessTasks = [
  { id: '1', title: 'Healthy Eating', description: 'Show your knowledge of nutritious foods and balanced diets.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '2', title: 'Fitness Routine', description: 'Share how you stay active and maintain physical fitness.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '3', title: 'Mental Well-Being', description: 'Demonstrate ways to manage stress and improve mental health.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '4', title: 'Sleep Habits', description: 'Express the importance of good sleep and how to improve sleep quality.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '5', title: 'Hydration & Nutrition', description: 'Highlight the benefits of drinking water and staying hydrated.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '6', title: 'Personal Hygiene', description: 'Show best practices for maintaining cleanliness and hygiene.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '7', title: 'Work-Life Balance', description: 'Discuss strategies for managing health while balancing responsibilities.', amount: getRandomAmount(), category: 'healthWellness' },
  { id: '8', title: 'Preventive Healthcare', description: 'Explain the importance of regular check-ups and vaccinations.', amount: getRandomAmount(), category: 'healthWellness' },
];

const generalKnowledgeTasks = [
  { id: '1', title: 'World History', description: 'Showcase your understanding of major historical events.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '2', title: 'Science & Innovations', description: 'Test your knowledge of groundbreaking discoveries and technologies.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '3', title: 'Geography & Cultures', description: 'Demonstrate awareness of global locations and diverse traditions.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '4', title: 'Famous Personalities', description: 'Share facts about influential figures in various fields.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '5', title: 'Current Affairs', description: 'Prove how well you stay updated with recent global events.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '6', title: 'Logical Reasoning', description: 'Solve challenges that test your critical thinking and problem-solving.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '7', title: 'Language & Vocabulary', description: 'Express your ability to understand and use words effectively.', amount: getRandomAmount(), category: 'generalKnowledge' },
  { id: '8', title: 'Math & Numbers', description: 'Show your numerical skills through calculations and puzzles.', amount: getRandomAmount(), category: 'generalKnowledge' },
];

const moneySavingsTasks = [
  { id: '1', title: 'Budgeting Basics', description: 'Show how you plan and track expenses wisely.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '2', title: 'Smart Spending', description: 'Demonstrate your ability to make cost-effective purchasing decisions.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '3', title: 'Emergency Fund Planning', description: 'Explain why saving for unexpected expenses is important.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '4', title: 'Investment Awareness', description: 'Share knowledge about different ways to grow your money.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '5', title: 'Avoiding Debt', description: 'Highlight strategies to manage and minimize financial liabilities.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '6', title: 'Income Diversification', description: 'Discuss ways to earn money from multiple sources.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '7', title: 'Saving Goals', description: 'Set realistic financial targets and strategies to achieve them.', amount: getRandomAmount(), category: 'moneySavings' },
  { id: '8', title: 'Understanding Interest Rates', description: 'Show how interest affects loans, savings, and financial growth.', amount: getRandomAmount(), category: 'moneySavings' },
];

export { personalQuizzesTasks, initialTasks, healthWellnessTasks, generalKnowledgeTasks, moneySavingsTasks };