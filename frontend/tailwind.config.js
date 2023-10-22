import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{html,js,jsx}"],
	theme: {
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
		},
		fontFamily: {
			display: ["Gilroy", "sans-serif"],
			body: ["Graphik", "sans-serif"],
		},
		borderWidth: {
			default: "1px",
			0: "0",
			2: "2px",
			4: "4px",
		},
		extend: {
			colors: {
				forest: "#799370",
			},
			spacing: {
				96: "24rem",
				128: "32rem",
			},
			height: {
				whole: "110vh",
			},
		},
		darkTheme: false,
	},
	plugins: [daisyui],
	daisyui: {
		themes: true, // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
		darkTheme: "dark", // name of one of the included themes for dark mode
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
		prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
	},
};
