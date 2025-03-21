// 語言包設定，方便後續擴充多語系功能
const langPack = {
    "zh-TW": {
      header: {
        title: "Coffeecat",
        subtitle: "全端開發者"
      },
      nav: {
        about: "關於我",
        projects: "作品集",
        skills: "技能",
        contact: "聯絡我"
      },
      about: {
        title: "關於我",
        education: "目前就讀鳳新高中",
        skills: "專業技能：寫程式 (C, C++, Python, Node.js, JavaScript, HTML, CSS)，Git，正在學習畫畫和日文，UI/UX",
        hobbies: "個人興趣：寫程式、畫畫、玩遊戲 (Minecraft, 崩壞星宆鐵道)",
        growth: "成長歷程：國中參與校內程式能力競賽第2；高中參與校內程式能力競賽第4；高中2年級時與朋友一起經營一個 Minecraft 伺服器（管理與運營、定期更新內容、開發模組及資料包/材質包）；目前正在開發 App：ACG大全",
        motto: "活在現實副本裡的程式碼玩家<br>BOSS：Bug & Deadline<br>如果生活是一款遊戲，我大概選了地獄難度",
        future: "繼續進行程式開發以及學習畫畫和日文",
        discord: "coffeecat2006"
      },
      projects: {
        title: "作品集"
      },
      skills: {
        title: "技能"
      },
      contact: {
        title: "聯絡我"
      }
    },
    "en": {
      header: {
        title: "Coffeecat",
        subtitle: "Full Stack Developer"
      },
      nav: {
        about: "About Me",
        projects: "Projects",
        skills: "Skills",
        contact: "Contact"
      },
      about: {
        title: "About Me",
        education: "Currently studying at Fengxin High School",
        skills: "Technical Skills: Programming (C, C++, Python, Node.js, JavaScript, HTML, CSS), Git; currently learning drawing and Japanese, UI/UX",
        hobbies: "Interests: Programming, Drawing, Gaming (Minecraft, Honkai Star Rail)",
        growth: "Growth: Participated in school programming competitions (2nd place in junior high; 4th place in high school); co-managed a Minecraft server in grade 11 (server management, regular updates, module and resource pack development); currently developing the ACG Encyclopedia App",
        motto: "A code player living in the reality replica<br>BOSS: Bug & Deadline<br>If life were a game, I'd probably choose Hell difficulty",
        future: "Continue programming development and learn drawing and Japanese",
        discord: "coffeecat2006"
      },
      projects: {
        title: "Projects"
      },
      skills: {
        title: "Skills"
      },
      contact: {
        title: "Contact"
      }
    }
  };
  
  // 切換語言函式：根據選取值更新頁面各處文字
  function switchLanguage(lang) {
    const pack = langPack[lang];
  
    // 更新 Header
    document.getElementById("header-title").textContent = pack.header.title;
    document.getElementById("header-subtitle").textContent = pack.header.subtitle;
    
    // 更新 Navigation
    document.getElementById("nav-about").textContent = pack.nav.about;
    document.getElementById("nav-projects").textContent = pack.nav.projects;
    document.getElementById("nav-skills").textContent = pack.nav.skills;
    document.getElementById("nav-contact").textContent = pack.nav.contact;
    
    // 更新 About 區塊（使用 innerHTML 支持 <br> 標籤）
    document.getElementById("about-title").textContent = pack.about.title;
    document.getElementById("about-content").innerHTML = `
      <p><strong>學歷 / Education：</strong> ${pack.about.education}</p>
      <p><strong>專業技能 / Technical Skills：</strong> ${pack.about.skills}</p>
      <p><strong>個人興趣 / Interests：</strong> ${pack.about.hobbies}</p>
      <p><strong>成長歷程 / Growth：</strong> ${pack.about.growth}</p>
      <p id="motto"><strong>座右銘 / Motto：</strong><br> ${pack.about.motto}</p>
      <p id="future-goal"><strong>未來目標 / Future Goal：</strong> ${pack.about.future}</p>
      <p><strong>Discord：</strong> ${pack.about.discord}</p>
    `;
    
    // 更新 Projects、Skills 與 Contact 區塊標題
    document.getElementById("projects-title").textContent = pack.projects.title;
    document.getElementById("skills-title").textContent = pack.skills.title;
    document.getElementById("contact-title").textContent = pack.contact.title;
  }
  
  // 設定語言切換事件
  document.getElementById("language-selector").addEventListener("change", function() {
    switchLanguage(this.value);
  });
  
  // 預設載入時切換到選單預設值
  switchLanguage(document.getElementById("language-selector").value);
  
  /* 下面為原有的動畫與平滑捲動功能 */
  
  // Intersection Observer 用於淡入動畫
  const observerOptions = {
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
  });
  
  // 平滑捲動導航
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  