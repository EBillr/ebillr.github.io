    document.addEventListener('DOMContentLoaded', () => {
      const html = document.documentElement;
      const themeToggle = document.getElementById('theme-toggle');
      const header = document.querySelector('header');
      
      // Set dark theme by default
      html.setAttribute('data-theme', 'dark');
      
      // Theme toggle functionality (instant change)
      themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
      });

      // Header scroll effect
      window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });

      // Initialize typewriter animation
      const words = document.querySelectorAll('.typewriter-word span');
      words.forEach(word => {
        word.style.willChange = 'transform, opacity';
      });

      // GitHub OAuth Integration
      const checkAuth = () => {
        const code = new URLSearchParams(window.location.search).get('code') || 
                   localStorage.getItem('github_temp_code');
        
        if (code) {
          // In a real app, you would send this to your backend
          console.log('GitHub auth code:', code);
          localStorage.removeItem('github_temp_code');
          
          // For demo purposes, we'll just show a login success
          const loginBtn = document.querySelector('.login-btn');
          if (loginBtn) {
            loginBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Logged In
            `;
            loginBtn.href = "#";
          }
        }
      };

      checkAuth();
    });
