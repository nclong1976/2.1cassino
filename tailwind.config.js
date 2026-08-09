/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        // figma:untitled (cZCvPbAn) — start
        "figma-text-1-7": "hsl(var(--figma-text-1-7))",
        "figma-text-2-7": "hsl(var(--figma-text-2-7))",
        "figma-text-3-7": "hsl(var(--figma-text-3-7))",
        "figma-text-4-7": "hsl(var(--figma-text-4-7))",
        "figma-text-5-7": "hsl(var(--figma-text-5-7))",
        "figma-text-6-7": "hsl(var(--figma-text-6-7))",
        "figma-text-7-7": "hsl(var(--figma-text-7-7))",
        "figma-text-8-7": "hsl(var(--figma-text-8-7))",
        "figma-text-9-7": "hsl(var(--figma-text-9-7))",
        "figma-text-10-7": "hsl(var(--figma-text-10-7))",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-secondary-3": "hsl(var(--figma-secondary-3))",
        "figma-accent-3": "hsl(var(--figma-accent-3))",
        "figma-muted-2": "hsl(var(--figma-muted-2))",
        "figma-text-1-6": "hsl(var(--figma-text-1-6))",
        "figma-text-2-6": "hsl(var(--figma-text-2-6))",
        "figma-text-3-6": "hsl(var(--figma-text-3-6))",
        "figma-text-4-6": "hsl(var(--figma-text-4-6))",
        "figma-text-5-6": "hsl(var(--figma-text-5-6))",
        "figma-text-6-6": "hsl(var(--figma-text-6-6))",
        "figma-text-7-6": "hsl(var(--figma-text-7-6))",
        "figma-text-8-6": "hsl(var(--figma-text-8-6))",
        "figma-text-9-6": "hsl(var(--figma-text-9-6))",
        "figma-text-10-6": "hsl(var(--figma-text-10-6))",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-primary-3": "hsl(var(--figma-primary-3))",
        "figma-secondary-2": "hsl(var(--figma-secondary-2))",
        "figma-accent-2": "hsl(var(--figma-accent-2))",
        "figma-surface": "hsl(var(--figma-surface))",
        "figma-border": "hsl(var(--figma-border))",
        "figma-highlight": "hsl(var(--figma-highlight))",
        "figma-subtle": "hsl(var(--figma-subtle))",
        "figma-color-9": "hsl(var(--figma-color-9))",
        "figma-color-11": "hsl(var(--figma-color-11))",
        "figma-color-12": "hsl(var(--figma-color-12))",
        "figma-color-13": "hsl(var(--figma-color-13))",
        "figma-color-14": "hsl(var(--figma-color-14))",
        "figma-text-1-5": "hsl(var(--figma-text-1-5))",
        "figma-text-2-5": "hsl(var(--figma-text-2-5))",
        "figma-text-3-5": "hsl(var(--figma-text-3-5))",
        "figma-text-4-5": "hsl(var(--figma-text-4-5))",
        "figma-text-5-5": "hsl(var(--figma-text-5-5))",
        "figma-text-6-5": "hsl(var(--figma-text-6-5))",
        "figma-text-7-5": "hsl(var(--figma-text-7-5))",
        "figma-text-8-5": "hsl(var(--figma-text-8-5))",
        "figma-text-9-5": "hsl(var(--figma-text-9-5))",
        "figma-text-10-5": "hsl(var(--figma-text-10-5))",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-text-1-4": "hsl(var(--figma-text-1-4))",
        "figma-text-2-4": "hsl(var(--figma-text-2-4))",
        "figma-text-3-4": "hsl(var(--figma-text-3-4))",
        "figma-text-4-4": "hsl(var(--figma-text-4-4))",
        "figma-text-5-4": "hsl(var(--figma-text-5-4))",
        "figma-text-6-4": "hsl(var(--figma-text-6-4))",
        "figma-text-7-4": "hsl(var(--figma-text-7-4))",
        "figma-text-8-4": "hsl(var(--figma-text-8-4))",
        "figma-text-9-4": "hsl(var(--figma-text-9-4))",
        "figma-text-10-4": "hsl(var(--figma-text-10-4))",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-primary-2": "hsl(var(--figma-primary-2))",
        "figma-accent": "hsl(var(--figma-accent))",
        "figma-muted": "hsl(var(--figma-muted))",
        "figma-text-1-3": "hsl(var(--figma-text-1-3))",
        "figma-text-2-3": "hsl(var(--figma-text-2-3))",
        "figma-text-3-3": "hsl(var(--figma-text-3-3))",
        "figma-text-4-3": "hsl(var(--figma-text-4-3))",
        "figma-text-5-3": "hsl(var(--figma-text-5-3))",
        "figma-text-6-3": "hsl(var(--figma-text-6-3))",
        "figma-text-7-3": "hsl(var(--figma-text-7-3))",
        "figma-text-8-3": "hsl(var(--figma-text-8-3))",
        "figma-text-9-3": "hsl(var(--figma-text-9-3))",
        "figma-text-10-3": "hsl(var(--figma-text-10-3))",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-primary": "hsl(var(--figma-primary))",
        "figma-secondary": "hsl(var(--figma-secondary))",
        "figma-text-1-2": "hsl(var(--figma-text-1-2))",
        "figma-text-2-2": "hsl(var(--figma-text-2-2))",
        "figma-text-3-2": "hsl(var(--figma-text-3-2))",
        "figma-text-4-2": "hsl(var(--figma-text-4-2))",
        "figma-text-5-2": "hsl(var(--figma-text-5-2))",
        "figma-text-6-2": "hsl(var(--figma-text-6-2))",
        "figma-text-7-2": "hsl(var(--figma-text-7-2))",
        "figma-text-8-2": "hsl(var(--figma-text-8-2))",
        "figma-text-9-2": "hsl(var(--figma-text-9-2))",
        "figma-text-10-2": "hsl(var(--figma-text-10-2))",
        // figma:untitled (cZCvPbAn) — end
      
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  		
  		
  		'figma-text-2': 'hsl(var(--figma-text-2))',
  		
  		'figma-text-3': 'hsl(var(--figma-text-3))',
  		
  		'figma-text-6': 'hsl(var(--figma-text-6))',
  		
  		'figma-text-10': 'hsl(var(--figma-text-10))',
  		
  		'figma-text-1': 'hsl(var(--figma-text-1))',
  		
  		'figma-text-7': 'hsl(var(--figma-text-7))',
  		
  		'figma-text-4': 'hsl(var(--figma-text-4))',
  		
  		'figma-text-9': 'hsl(var(--figma-text-9))',
  		
  		'figma-text-5': 'hsl(var(--figma-text-5))',
  		
  		'figma-text-8': 'hsl(var(--figma-text-8))',
  		
  		
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		
  		
  		fontSize: {
        // figma:untitled (cZCvPbAn) — start
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-24": "24px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-13": "13px",
        "figma-15": "15px",
        "figma-17": "17px",
        "figma-18": "18px",
        "figma-20": "20px",
        "figma-21": "21px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-24": "24px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-13": "13px",
        "figma-15": "15px",
        "figma-17": "17px",
        "figma-18": "18px",
        "figma-20": "20px",
        "figma-21": "21px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-19": "19px",
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-22": "22px",
        "figma-23": "23px",
        "figma-24": "24px",
        "figma-25": "25px",
        "figma-26": "26px",
        "figma-27": "27px",
        "figma-28": "28px",
        "figma-32": "32px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-16": "16px",
        "figma-18": "18px",
        "figma-22": "22px",
        "figma-24": "24px",
        "figma-37": "37px",
        "figma-38": "38px",
        "figma-42": "42px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-12": "12px",
        "figma-14": "14px",
        "figma-15": "15px",
        "figma-16": "16px",
        "figma-19": "19px",
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-22": "22px",
        "figma-24": "24px",
        "figma-25": "25px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-17": "17px",
        "figma-18": "18px",
        "figma-19": "19px",
        "figma-25": "25px",
        "figma-27": "27px",
        "figma-30": "30px",
        // figma:untitled (cZCvPbAn) — end
      
  			
  			'figma-10': '10px',
  			
  			'figma-11': '11px',
  			
  			'figma-12': '12px',
  			
  			'figma-13': '13px',
  			
  			'figma-14': '14px',
  			
  			'figma-17': '17px',
  			
  		},
  		
  		
  		fontWeight: {
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-medium": "500",
        "figma-bold": "700",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-medium": "500",
        "figma-bold": "700",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-semibold": "600",
        "figma-bold": "700",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-bold": "700",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-semibold": "600",
        "figma-bold": "700",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-normal": "400",
        "figma-semibold": "600",
        // figma:untitled (cZCvPbAn) — end
      
  			
  			'figma-light': '300',
  			
  			'figma-normal': '400',
  			
  			'figma-bold': '700',
  			
  		},
  		
  		
  		lineHeight: {
        // figma:untitled (cZCvPbAn) — start
        "figma-23": "23px",
        "figma-25": "25px",
        "figma-26": "26px",
        "figma-28": "28px",
        "figma-29": "29px",
        "figma-30": "30px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-22": "22px",
        "figma-23": "23px",
        "figma-24": "24px",
        "figma-26": "26px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-23": "23px",
        "figma-25": "25px",
        "figma-26": "26px",
        "figma-28": "28px",
        "figma-29": "29px",
        "figma-30": "30px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-22": "22px",
        "figma-23": "23px",
        "figma-24": "24px",
        "figma-26": "26px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-20": "20px",
        "figma-22": "22px",
        "figma-23": "23px",
        "figma-24": "24px",
        "figma-25": "25px",
        "figma-26": "26px",
        "figma-27": "27px",
        "figma-28": "28px",
        "figma-29": "29px",
        "figma-30": "30px",
        "figma-31": "31px",
        "figma-36": "36px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-17": "17px",
        "figma-18": "18px",
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-31": "31px",
        "figma-32": "32px",
        "figma-48": "48px",
        "figma-49": "49px",
        "figma-50": "50px",
        "figma-51": "51px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-12": "12px",
        "figma-13": "13px",
        "figma-14": "14px",
        "figma-16": "16px",
        "figma-17": "17px",
        "figma-18": "18px",
        "figma-19": "19px",
        "figma-20": "20px",
        "figma-22": "22px",
        "figma-26": "26px",
        "figma-30": "30px",
        "figma-31": "31px",
        "figma-33": "33px",
        "figma-34": "34px",
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-19": "19px",
        "figma-20": "20px",
        "figma-21": "21px",
        "figma-25": "25px",
        "figma-29": "29px",
        "figma-30": "30px",
        "figma-35": "35px",
        "figma-37": "37px",
        "figma-38": "38px",
        "figma-40": "40px",
        "figma-41": "41px",
        // figma:untitled (cZCvPbAn) — end
      
  			
  			'figma-11': '11px',
  			
  			'figma-12': '12px',
  			
  			'figma-13': '13px',
  			
  			'figma-14': '14px',
  			
  			'figma-15': '15px',
  			
  			'figma-16': '16px',
  			
  			'figma-17': '17px',
  			
  			'figma-22': '22px',
  			
  			'figma-31': '31px',
  			
  		},
  		
  		
  		fontFamily: {
        // figma:untitled (cZCvPbAn) — start
        "figma-hanken-grotesk": ['"Hanken Grotesk"', 'sans-serif'],
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-gabarito": ['"Gabarito"', 'sans-serif'],
        "figma-roboto-flex": ['"Roboto Flex"', 'sans-serif'],
        "figma-commissioner": ['"Commissioner"', 'sans-serif'],
        "figma-open-sans": ['"Open Sans"', 'sans-serif'],
        "figma-spline-sans": ['"Spline Sans"', 'sans-serif'],
        "figma-schibsted-grotesk": ['"Schibsted Grotesk"', 'sans-serif'],
        "figma-jaldi": ['"Jaldi"', 'sans-serif'],
        "figma-mukta": ['"Mukta"', 'sans-serif'],
        "figma-murecho": ['"Murecho"', 'sans-serif'],
        "figma-archivo": ['"Archivo"', 'sans-serif'],
        "figma-atkinson-hyperlegible": ['"Atkinson Hyperlegible"', 'sans-serif'],
        "figma-ibm-plex-sans": ['"IBM Plex Sans"', 'sans-serif'],
        "figma-instrument-sans": ['"Instrument Sans"', 'sans-serif'],
        "figma-pt-sans": ['"PT Sans"', 'sans-serif'],
        "figma-beiruti": ['"Beiruti"', 'sans-serif'],
        "figma-istok-web": ['"Istok Web"', 'sans-serif'],
        "figma-pontano-sans": ['"Pontano Sans"', 'sans-serif'],
        "figma-tauri": ['"Tauri"', 'sans-serif'],
        "figma-noto-sans": ['"Noto Sans"', 'sans-serif'],
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-cabin": ['"Cabin"', 'sans-serif'],
        "figma-geist": ['"Geist"', 'sans-serif'],
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-oxygen": ['"Oxygen"', 'sans-serif'],
        "figma-roboto": ['"Roboto"', 'sans-serif'],
        "figma-mulish": ['"Mulish"', 'sans-serif'],
        "figma-englebert": ['"Englebert"', 'sans-serif'],
        "figma-epilogue": ['"Epilogue"', 'sans-serif'],
        // figma:untitled (cZCvPbAn) — end
      
        // figma:untitled (cZCvPbAn) — start
        "figma-microsoft-sans-serif": ['"Microsoft Sans Serif"', 'sans-serif'],
        "figma-times-new-roman": ['"Times New Roman"', 'sans-serif'],
        "figma-arial-narrow": ['"Arial Narrow"', 'sans-serif'],
        // figma:untitled (cZCvPbAn) — end
      
  			
  			'heading': ['"Sofadi One"', 'sans-serif'],
  			
  			'paragraph': ['"Arial"', 'sans-serif'],
  			
  			'figma-inter': ['"Inter"', 'sans-serif'],
  			
  			'figma-noto-sans-sc': ['"Noto Sans SC"', 'sans-serif'],
  			
  			'figma-arimo': ['"Arimo"', 'sans-serif'],
  			
  			'figma-manrope': ['"Manrope"', 'sans-serif'],
  			
  			'figma-news-cycle': ['"News Cycle"', 'sans-serif'],
  			
  		},
  		
  		
  	}
  },
  plugins: [require("tailwindcss-animate")],
};