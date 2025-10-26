import { StringHelper } from '../helpers/StringHelper';

/**
 * Test data factory for generating test data
 */
export class TestDataFactory {
  // Topic options available in the feedback form
  static readonly TOPIC_OPTIONS = [
    'Our Website (Nike.com)',
    'Our Apps (Nike App, NRC, NTC, SNKRS)',
    'Our Retail Locations',
    'Our Products',
    'Customer Service Experience',
    'Nike as a Company',
    'Something Else'
  ] as const;

  // Primary goal options available in the feedback form
  static readonly PRIMARY_GOAL_OPTIONS = [
    'Browse/See What\'s New',
    'Search for a Specific Product',
    'Research/Compare Products (size, fit, features, price)',
    'Explore Sale Items',
    'Plan for a Store Trip',
    'Contact Customer Support',
    'Explore Nike Membership',
    'Something Else'
  ] as const;

  /**
   * Generate user test data
   */
  static createFeedBack(overrides: Partial<FeedbackData> = {}): FeedbackData {
    const defaultData: FeedbackData = {
      language: 'English',
      topic: this.TOPIC_OPTIONS[0], // Default to first option
      rating: 5,
      message: 'This is a test feedback message',
      primaryGoal: this.PRIMARY_GOAL_OPTIONS[0], // Default to first option
      accomplishThatGoal: 5
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Get a random topic option
   */
  static getRandomTopic(): string {
    const randomIndex = Math.floor(Math.random() * this.TOPIC_OPTIONS.length);
    return this.TOPIC_OPTIONS[randomIndex];
  }

  /**
   * Get a random primary goal option
   */
  static getRandomPrimaryGoal(): string {
    const randomIndex = Math.floor(Math.random() * this.PRIMARY_GOAL_OPTIONS.length);
    return this.PRIMARY_GOAL_OPTIONS[randomIndex];
  }

  /**
   * Create feedback with random topic
   */
  static createFeedBackWithRandomTopic(overrides: Partial<FeedbackData> = {}): FeedbackData {
    return this.createFeedBack({
      topic: this.getRandomTopic(),
      ...overrides
    });
  }

  /**
   * Create feedback with random primary goal
   */
  static createFeedBackWithRandomPrimaryGoal(overrides: Partial<FeedbackData> = {}): FeedbackData {
    return this.createFeedBack({
      primaryGoal: this.getRandomPrimaryGoal(),
      ...overrides
    });
  }

  /**
   * Create feedback with random topic and primary goal
   */
  static createFeedBackWithRandomOptions(overrides: Partial<FeedbackData> = {}): FeedbackData {
    return this.createFeedBack({
      topic: this.getRandomTopic(),
      primaryGoal: this.getRandomPrimaryGoal(),
      ...overrides
    });
  }
}

// Type definitions
export type TopicOption = typeof TestDataFactory.TOPIC_OPTIONS[number];
export type PrimaryGoalOption = typeof TestDataFactory.PRIMARY_GOAL_OPTIONS[number];

export interface FeedbackData {
  language: string;
  topic: TopicOption | string;
  rating: number;
  message: string;
  primaryGoal: PrimaryGoalOption | string;
  accomplishThatGoal: number;
}