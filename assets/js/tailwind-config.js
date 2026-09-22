tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#eff6ff',
                            100: '#dbeaff',
                            500: '#3b82f6',
                            600: '#0066cc',
                            700: '#0052a3',
                            800: '#1e40af',
                            900: '#1e3a8a',
                            accent: '#10b981'
                        }
                    },
                    fontFamily: {
                        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
                        latin: ['Inter', 'system-ui', 'sans-serif']
                    },
                    boxShadow: {
                        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
                        'glow': '0 0 20px rgba(0, 102, 204, 0.35)'
                    }
                }
            }
        }
