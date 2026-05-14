/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#0F0E17',
        bg2:      '#1A1828',
        bg3:      '#221F35',
        border:   '#2E2B45',
        border2:  '#3D3960',
        text:     '#E8E6F0',
        text2:    '#9B96B8',
        text3:    '#6B6589',
        purple:   '#7F77DD',
        purple2:  '#534AB7',
        green:    '#22C97A',
        gold:     '#FAC775',
        red:      '#D85A30',
        orange:   '#FF9068',
        blue:     '#4A9EE0',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '10px',
      }
    },
  },
  plugins: [],
}
