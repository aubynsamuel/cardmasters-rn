/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        containerBackground: "#076324",
        gold: "#FFD700",
        white: "#FFFFFF",
        mainTextColor: "#FFFFFF",
        textShadow: "rgba(0, 0, 0, 0.5)",
        cardShadow: "#000",
        roundCircleBackground: "#666",
        roundCircleBorder: "#999",
        playerArea: "rgba(0, 0, 0, 0.2)",
        opponentArea: "rgba(255, 0, 0, 0.2)",
        humanAreaBackground: "rgba(0, 0, 255, 0.2)",
        cardBackBackground: "#B22222",
        cardBackBorder: "#ccc",
        statusBackground: "rgba(0, 0, 0, 0.6)",
        logContainerBackground: "rgba(0, 0, 0, 0.5)",
        logText: "#ddd",
        buttonBackground: "#4CAF50",
      },
    },
  },
  plugins: [],
};
