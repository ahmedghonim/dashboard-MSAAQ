export type OnBoardingQuestions = {
  id: number;
  title: string;
  subtitle: string;
  sort: number;
  page: number;
  status: string;
  type: string;
  choices: Array<OnboardingChoice>;
};
export type OnboardingChoice = {
  id: number;
  sort: number;
  title: string;
  icon: any;
};
export enum StepsValues {
  Prepare = 1,
  About = 2,
  Build = 3,
  Done = 4
}
