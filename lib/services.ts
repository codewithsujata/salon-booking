import { Service } from "./types";

// Default services — salon owner can update these in the DB
export const DEFAULT_SERVICES: Service[] = [
  {
    id: "haircut",
    name: "Haircut & Style",
    duration: 60,
    price: 45,
    description: "Cut, wash, and blow-dry",
    icon: "✂️",
  },
  {
    id: "color",
    name: "Hair Coloring",
    duration: 120,
    price: 95,
    description: "Full color or highlights",
    icon: "🎨",
  },
  {
    id: "manicure",
    name: "Manicure",
    duration: 45,
    price: 30,
    description: "Classic or gel manicure",
    icon: "💅",
  },
  {
    id: "pedicure",
    name: "Pedicure",
    duration: 60,
    price: 40,
    description: "Relaxing foot treatment",
    icon: "🦶",
  },
  {
    id: "facial",
    name: "Facial Treatment",
    duration: 75,
    price: 65,
    description: "Deep cleanse and hydration",
    icon: "🧖",
  },
  {
    id: "massage",
    name: "Head Massage",
    duration: 30,
    price: 25,
    description: "Relaxing scalp massage",
    icon: "💆",
  },
];

// Business hours config
export const BUSINESS_HOURS = {
  open: "09:00",
  close: "19:00",
  interval: 30, // minutes between slots
  // 0 = Sunday, 6 = Saturday
  closedDays: [0], // Closed on Sundays
};
