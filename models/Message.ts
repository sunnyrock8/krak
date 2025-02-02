import { Dish } from "./DIsh";

export interface Message {
  type: "text" | "dishes" | "recipe" | "ingredients";
  text: string;
  sentBy: "user" | "bot";
  dishes?: Dish[];
  steps?: { instruction: string }[];
  ingredients?: {
    image: string;
    name: string;
  }[];
}
