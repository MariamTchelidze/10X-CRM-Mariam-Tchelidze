"use strict";

/* --- Frontend Translation Controller --- */
(function initTranslations() {
  const SETTINGS_KEY = "crm_app_settings";
  const LANGUAGE_KEY = "crm_language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "ka"];
  const SKIP_SELECTOR = [
    "script",
    "style",
    "svg",
    "[data-i18n-skip]",
    ".js-clients-list",
    ".js-task-board",
    ".js-task-archive-list",
    ".js-recycle-bin-list",
    ".js-client-notes-list",
    ".js-communication-messages",
    ".js-ai-chat-messages",
    ".js-profile-call-history-list",
  ].join(",");

  const translations = {
    en: {
      keys: {},
      text: {},
      placeholders: {},
      attributes: {},
      titles: {
        login: "Login | 10X CRM",
        signup: "Sign Up | 10X CRM",
        forgot: "Forgot Password | 10X CRM",
        dashboard: "Dashboard | 10X CRM",
        clients: "Clients | 10X CRM",
        profile: "Profile | 10X CRM",
      },
    },
    ka: {
      keys: {},
      text: {
        "Page tools": "გვერდის ხელსაწყოები",
        "10X CRM dashboard": "10X CRM დეშბორდი",
        "10X CRM sign in": "10X CRM შესვლა",
        "CRM preview": "CRM გადახედვა",
        "Preview statistics": "სტატისტიკის გადახედვა",
        "Pipeline preview": "პაიპლაინის გადახედვა",
        "Project readiness": "პროექტის მზადყოფნა",
        "Recovery highlights": "აღდგენის მთავარი პუნქტები",
        "Recovery flow readiness": "აღდგენის პროცესის მზადყოფნა",
        "10X CRM": "10X CRM",
        "Manage clients, projects, and daily sales flow in one workspace.": "მართეთ კლიენტები, პროექტები და ყოველდღიური გაყიდვების პროცესი ერთ სივრცეში.",
        "A clean CRM foundation with authentication, dashboard insights, client records, and profile settings.": "სუფთა CRM საფუძველი ავტორიზაციით, დეშბორდის ანალიტიკით, კლიენტების ჩანაწერებით და პროფილის პარამეტრებით.",
        "Clients": "კლიენტები",
        "Active deals": "აქტიური გარიგებები",
        "Pipeline health": "პაიპლაინის მდგომარეობა",
        "Monthly target": "თვიური მიზანი",
        "Welcome Back": "კეთილი დაბრუნება",
        "Sign in to continue managing clients, projects, and daily workflow.": "შედით, რომ გააგრძელოთ კლიენტების, პროექტების და ყოველდღიური სამუშაო პროცესის მართვა.",
        "Email Address": "ელფოსტის მისამართი",
        "Password": "პაროლი",
        "Remember me": "დამიმახსოვრე",
        "Forgot Password?": "დაგავიწყდათ პაროლი?",
        "Sign In": "შესვლა",
        "or": "ან",
        "Social login": "სოციალური შესვლა",
        "Social sign up": "სოციალური რეგისტრაცია",
        "Continue with Google": "Google-ით გაგრძელება",
        "Do not have an account?": "არ გაქვთ ანგარიში?",
        "Sign Up": "რეგისტრაცია",
        "Create Account": "ანგარიშის შექმნა",
        "Start managing your clients, projects, and team from one secure workspace.": "დაიწყეთ კლიენტების, პროექტების და გუნდის მართვა ერთი დაცული სივრციდან.",
        "Full Name": "სრული სახელი",
        "Optional for now, useful for profile setup later.": "ამ ეტაპზე არჩევითია, მოგვიანებით პროფილისთვის გამოგადგებათ.",
        "Confirm Password": "გაიმეორეთ პაროლი",
        "I agree to use this CRM project responsibly for the course demo.": "ვეთანხმები, რომ ეს CRM პროექტი კურსის დემოსთვის პასუხისმგებლობით გამოვიყენო.",
        "Already have an account?": "უკვე გაქვთ ანგარიში?",
        "Log In": "შესვლა",
        "A responsive CRM shell ready for vanilla JavaScript.": "რესპონსიული CRM სტრუქტურა, მზად Vanilla JavaScript-ისთვის.",
        "Structured markup, clear IDs, and stable data hooks make the upcoming functionality easier to build.": "სტრუქტურირებული მარკაპი, მკაფიო ID-ები და სტაბილური data hook-ები მომავალ ფუნქციონალს უფრო მარტივად ასაშენებელს ხდის.",
        "Core pages": "ძირითადი გვერდები",
        "Storage keys": "საცავის გასაღებები",
        "Themes": "თემები",
        "Markup readiness": "მარკაპის მზადყოფნა",
        "Account recovery": "ანგარიშის აღდგენა",
        "Reset access and get back to your CRM workspace.": "აღადგინეთ წვდომა და დაბრუნდით CRM სამუშაო სივრცეში.",
        "Keep the recovery flow simple, private, and available before the user is signed in.": "აღდგენის პროცესი უნდა იყოს მარტივი, პირადი და ხელმისაწვდომი ავტორიზაციამდე.",
        "Safe": "უსაფრთხო",
        "Generic response": "ზოგადი პასუხი",
        "Fast": "სწრაფი",
        "Email reset flow": "ელფოსტით აღდგენა",
        "Public": "საჯარო",
        "No login required": "შესვლა საჭირო არ არის",
        "Recovery markup": "აღდგენის მარკაპი",
        "Ready": "მზადაა",
        "Enter your email and we will show the next reset step without revealing whether the account exists.": "შეიყვანეთ ელფოსტა და გაჩვენებთ შემდეგ ნაბიჯს ისე, რომ არ გამჟღავნდეს ანგარიშის არსებობა.",
        "If an account exists for this email, reset instructions have been sent.": "თუ ამ ელფოსტაზე ანგარიში არსებობს, აღდგენის ინსტრუქცია გაგზავნილია.",
        "Send Reset Link": "აღდგენის ბმულის გაგზავნა",
        "Remembered your password?": "გაგახსენდათ პაროლი?",
        "New to 10X CRM?": "ახალი ხართ 10X CRM-ში?",

        "Dashboard": "დეშბორდი",
        "Profile": "პროფილი",
        "Workspace": "სამუშაო სივრცე",
        "Sales": "გაყიდვები",
        "Reports": "რეპორტები",
        "Favourites": "რჩეულები",
        "Activity": "აქტივობა",
        "Files": "ფაილები",
        "Team": "გუნდი",
        "Users": "მომხმარებლები",
        "Roles": "როლები",
        "Tasks": "დავალებები",
        "Task Board": "დავალებების დაფა",
        "Recycle Bin": "სანაგვე",
        "Communications": "კომუნიკაციები",
        "Messenger": "მესენჯერი",
        "10X SensAI": "10X SensAI",
        "Phone": "ტელეფონი",
        "Settings": "პარამეტრები",
        "Logout": "გასვლა",
        "Today": "დღეს",
        "Search": "ძიება",
        "Add Client": "კლიენტის დამატება",
        "Add Task": "დავალების დამატება",
        "Export File": "ფაილის ექსპორტი",
        "Open": "გახსნა",
        "Archive": "არქივი",
        "Delete": "წაშლა",
        "Remove": "წაშლა",
        "Restore": "აღდგენა",
        "Cancel": "გაუქმება",
        "Close": "დახურვა",
        "Save Changes": "ცვლილებების შენახვა",
        "Done": "მზადაა",
        "Send": "გაგზავნა",
        "Add": "დამატება",
        "Edit": "რედაქტირება",
        "Upload Image": "სურათის ატვირთვა",
        "Save": "შენახვა",

        "Application settings": "აპლიკაციის პარამეტრები",
        "Adjust the CRM appearance for this browser. These options are saved locally.": "შეცვალეთ CRM-ის ვიზუალი ამ ბრაუზერში. ეს პარამეტრები ლოკალურად ინახება.",
        "Theme": "თემა",
        "Dark": "მუქი",
        "Default CRM theme": "ნაგულისხმევი CRM თემა",
        "Light": "ღია",
        "Bright workspace": "ნათელი სამუშაო სივრცე",
        "Custom": "მორგებული",
        "Accent color only": "მხოლოდ აქცენტის ფერი",
        "Font Size": "შრიფტის ზომა",
        "Small": "პატარა",
        "Dense reading": "კომპაქტური კითხვა",
        "Medium": "საშუალო",
        "Recommended": "რეკომენდებული",
        "Large": "დიდი",
        "More readable": "უფრო მარტივად წასაკითხი",
        "Layout Density": "განლაგების სიმჭიდროვე",
        "Comfortable": "კომფორტული",
        "Roomier spacing": "უფრო ფართო დაშორებები",
        "Compact": "კომპაქტური",
        "More data on screen": "მეტი მონაცემი ეკრანზე",
        "Custom Appearance": "მორგებული ვიზუალი",
        "Uses the current Dark or Light base and unlocks accent colors.": "იყენებს მიმდინარე მუქ ან ღია საფუძველს და რთავს აქცენტის ფერებს.",
        "Accent color": "აქცენტის ფერი",
        "Suggested accent colors": "შემოთავაზებული აქცენტის ფერები",
        "Orange": "ნარინჯისფერი",
        "Blue": "ლურჯი",
        "Green": "მწვანე",
        "Purple": "იისფერი",
        "Appearance controls": "ვიზუალის კონტროლი",
        "Language": "ენა",
        "English": "ინგლისური",
        "Current default": "მიმდინარე ნაგულისხმევი",
        "Georgian": "ქართული",
        "Prepared for translation": "მზადაა თარგმნისთვის",
        "Danger Zone": "საფრთხის ზონა",
        "Delete Account": "ანგარიშის წაშლა",
        "Delete this account and all CRM data saved in this browser.": "წაშალეთ ეს ანგარიში და ამ ბრაუზერში შენახული ყველა CRM მონაცემი.",
        "Are you sure to delete account?": "ნამდვილად გსურთ ანგარიშის წაშლა?",
        "To delete your account permanently please enter your password here.": "ანგარიშის სამუდამოდ წასაშლელად შეიყვანეთ პაროლი.",
        "This action permanently clears the account, session, clients, profile image, tasks, notifications, settings, and theme preferences stored in this browser.": "ეს მოქმედება სამუდამოდ გაასუფთავებს ამ ბრაუზერში შენახულ ანგარიშს, სესიას, კლიენტებს, პროფილის სურათს, დავალებებს, შეტყობინებებს, პარამეტრებს და თემის არჩევანს.",

        "CRM DATABASE": "CRM მონაცემთა ბაზა",
        "Search and filter client records loaded from the demo API and saved locally.": "მოძებნეთ და გაფილტრეთ დემო API-დან ჩატვირთული და ლოკალურად შენახული კლიენტები.",
        "Search clients": "კლიენტების ძიება",
        "Search and filter": "ძიება და ფილტრი",
        "Client List": "კლიენტების სია",
        "Search by name, company, or email": "ძიება სახელით, კომპანიით ან ელფოსტით",
        "Newest first": "ჯერ უახლესი",
        "Name A-Z": "სახელი A-Z",
        "Name Z-A": "სახელი Z-A",
        "Highest value": "უმაღლესი ღირებულება",
        "Lowest value": "უმდაბლესი ღირებულება",
        "Sort clients": "კლიენტების დალაგება",
        "All clients": "ყველა კლიენტი",
        "Leads": "ლიდები",
        "Contacted": "დაკავშირებული",
        "Won": "მოგებული",
        "Lost": "წაგებული",
        "Client Details": "კლიენტის დეტალები",
        "Add the main client details now. Notes can be added here or managed later from client details.": "დაამატეთ კლიენტის ძირითადი დეტალები. შენიშვნები შეგიძლიათ აქ დაამატოთ ან მოგვიანებით კლიენტის დეტალებიდან მართოთ.",
        "Client details": "კლიენტის დეტალები",
        "Deal Value": "გარიგების ღირებულება",
        "Status": "სტატუსი",
        "Notes": "შენიშვნები",
        "Add Note": "შენიშვნის დამატება",
        "Reminder": "შეხსენება",
        "Set Reminder": "შეხსენების დაყენება",
        "Author": "ავტორი",
        "Attach task": "დავალების მიბმა",
        "Note status": "შენიშვნის სტატუსი",
        "No task": "დავალების გარეშე",
        "Create new task": "ახალი დავალების შექმნა",
        "Reviewed": "განხილულია",
        "Approved": "დამტკიცებულია",
        "Declined": "უარყოფილია",
        "Processed": "დამუშავებულია",

        "Account Settings": "ანგარიშის პარამეტრები",
        "Edit Profile": "პროფილის რედაქტირება",
        "Personal Details": "პირადი დეტალები",
        "Short Bio": "მოკლე ბიო",
        "Role": "როლი",
        "Private Statistics": "პირადი სტატისტიკა",
        "Total leads brought in": "შემოტანილი ლიდები",
        "Successful contracts": "წარმატებული კონტრაქტები",
        "Failed contracts": "წარუმატებელი კონტრაქტები",
        "KPI score index": "KPI ქულის ინდექსი",
        "Call History": "ზარების ისტორია",
        "Password Settings": "პაროლის პარამეტრები",
        "Current Password": "მიმდინარე პაროლი",
        "New Password": "ახალი პაროლი",
        "Update Password": "პაროლის განახლება",

        "Notifications": "შეტყობინებები",
        "Updates": "განახლებები",
        "Open linked items, select notifications, or delete only read updates.": "გახსენით დაკავშირებული ელემენტები, მონიშნეთ შეტყობინებები ან წაშალეთ მხოლოდ წაკითხული განახლებები.",
        "Mark all read": "ყველას წაკითხვა",
        "Mark all": "მონიშვნა",
        "Delete selected": "მონიშნულის წაშლა",
        "Delete read": "წაკითხულის წაშლა",
        "No notifications yet.": "შეტყობინებები ჯერ არ არის.",

        "Task Details": "დავალების დეტალები",
        "Open Task": "დავალების გახსნა",
        "Edit task content, manage checklist items, and leave team comments.": "დაარედაქტირეთ დავალება, მართეთ ჩეკლისტი და დატოვეთ გუნდის კომენტარები.",
        "Title": "სათაური",
        "Description": "აღწერა",
        "Checklist": "ჩეკლისტი",
        "Comments": "კომენტარები",
        "Assignee": "შემსრულებელი",
        "Priority": "პრიორიტეტი",
        "Due date": "ვადა",
        "High": "მაღალი",
        "Low": "დაბალი",
        "To Do": "გასაკეთებელი",
        "In Progress": "მიმდინარე",
        "Overdue": "ვადაგადაცილებული",
        "Move to Recycle Bin": "სანაგვეში გადატანა",
        "Delete Permanently": "სამუდამოდ წაშლა",
        "Choose Delete Option": "აირჩიეთ წაშლის ვარიანტი",
        "Would you like to delete the task permanently or move it to recycle bin?": "გსურთ დავალების სამუდამოდ წაშლა თუ სანაგვეში გადატანა?",

        "Communication": "კომუნიკაცია",
        "Team Communication Chat": "გუნდის ჩატი",
        "Call, text, WhatsApp, or continue your internal team conversation.": "დარეკეთ, გაგზავნეთ ტექსტი, WhatsApp ან გააგრძელეთ შიდა გუნდის საუბარი.",
        "Send to": "გაგზავნა",
        "Sales Team": "გაყიდვების გუნდი",
        "Support Team": "მხარდაჭერის გუნდი",
        "Open CRM Phone": "CRM ტელეფონის გახსნა",
        "Client Directory": "კლიენტების სია",
        "Text SMS": "SMS ტექსტი",
        "WhatsApp": "WhatsApp",
        "Application Phone": "აპლიკაციის ტელეფონი",
        "10X CRM Phone": "10X CRM ტელეფონი",
        "Use the CRM keypad to prepare calls and save call notes.": "გამოიყენეთ CRM კლავიატურა ზარების მოსამზადებლად და ზარის შენიშვნების შესანახად.",
        "Dial number": "აკრიფეთ ნომერი",
        "Call": "ზარი",
        "Clear": "გასუფთავება",
        "Call Notes": "ზარის შენიშვნები",
        "Save Call Note": "ზარის შენიშვნის შენახვა",
        "10X SensAI Assistant": "10X SensAI ასისტენტი",
        "Ask for CRM guidance, summaries, exports, or next-step ideas.": "ჰკითხეთ CRM რჩევები, შეჯამებები, ექსპორტები ან შემდეგი ნაბიჯების იდეები.",
      },
      placeholders: {
        "Enter your email": "შეიყვანეთ ელფოსტა",
        "Enter your password": "შეიყვანეთ პაროლი",
        "Enter your full name": "შეიყვანეთ სრული სახელი",
        "Company name": "კომპანიის სახელი",
        "Create a password": "შექმენით პაროლი",
        "Confirm your password": "გაიმეორეთ პაროლი",
        "Search clients": "კლიენტების ძიება",
        "Write a dated note": "დაწერეთ დათარიღებული შენიშვნა",
        "Add checklist item": "ჩეკლისტის ელემენტის დამატება",
        "Leave directions, error notes, or next steps": "დატოვეთ მითითებები, შეცდომის შენიშვნები ან შემდეგი ნაბიჯები",
        "Message your team": "მისწერეთ გუნდს",
        "Dial number": "აკრიფეთ ნომერი",
        "Write important details from this call": "ჩაწერეთ მნიშვნელოვანი დეტალები ამ ზარიდან",
        "Ask 10X SensAI": "ჰკითხეთ 10X SensAI-ს",
      },
      attributes: {
        "Switch theme": "თემის შეცვლა",
        "Switch to dark theme": "მუქ თემაზე გადასვლა",
        "Switch to light theme": "ღია თემაზე გადასვლა",
        "Show password": "პაროლის ჩვენება",
        "Hide password": "პაროლის დამალვა",
        "Close settings": "პარამეტრების დახურვა",
        "Open navigation": "ნავიგაციის გახსნა",
        "Close navigation": "ნავიგაციის დახურვა",
        "Open notifications": "შეტყობინებების გახსნა",
        "Close notifications": "შეტყობინებების დახურვა",
        "Close modal": "ფანჯრის დახურვა",
        "Suggested accent colors": "შემოთავაზებული აქცენტის ფერები",
        "Primary navigation": "მთავარი ნავიგაცია",
        "Main navigation": "მთავარი ნავიგაცია",
      },
      titles: {
        login: "შესვლა | 10X CRM",
        signup: "რეგისტრაცია | 10X CRM",
        forgot: "პაროლის აღდგენა | 10X CRM",
        dashboard: "დეშბორდი | 10X CRM",
        clients: "კლიენტები | 10X CRM",
        profile: "პროფილი | 10X CRM",
      },
    },
  };

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const getValidLanguage = (language) => (SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE);

  const readStoredSettings = () => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch (error) {
      return {};
    }
  };

  const getStoredLanguage = () => {
    try {
      const settingsLanguage = readStoredSettings().language;
      const legacyLanguage = localStorage.getItem(LANGUAGE_KEY);
      return getValidLanguage(settingsLanguage || legacyLanguage || DEFAULT_LANGUAGE);
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  };

  const saveLanguage = (language) => {
    try {
      const settings = readStoredSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, language }));
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      // The page can still translate during this session if storage is unavailable.
    }
  };

  let currentLanguage = getStoredLanguage();
  let isApplyingTranslations = false;
  let observerFrame = 0;
  const originalTextNodes = new WeakMap();

  const getDictionary = () => translations[currentLanguage] || translations[DEFAULT_LANGUAGE];

  const translate = (key, fallback = key) => {
    const dictionary = getDictionary();
    return dictionary.keys[key] || dictionary.text[key] || translations[DEFAULT_LANGUAGE].keys[key] || fallback;
  };

  const shouldSkipNode = (node) => {
    const parent = node.parentElement;
    return !parent || parent.closest(SKIP_SELECTOR);
  };

  const translateTextNode = (node) => {
    if (shouldSkipNode(node)) return;

    const original = originalTextNodes.get(node) || normalizeText(node.nodeValue);
    const translated = currentLanguage === DEFAULT_LANGUAGE ? original : getDictionary().text[original];

    if (!translated) return;

    originalTextNodes.set(node, original);

    const leadingSpace = node.nodeValue.match(/^\s*/)?.[0] || "";
    const trailingSpace = node.nodeValue.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leadingSpace}${translated}${trailingSpace}`;
  };

  const translateElementKey = (element) => {
    const key = element.dataset.i18n;

    if (!key) return;

    element.textContent = translate(key, element.textContent);
  };

  const translateAttribute = (element, attribute, datasetKey, dictionary) => {
    if (!element.hasAttribute(attribute)) return;

    const original = element.dataset[datasetKey] || element.getAttribute(attribute);
    const translated = dictionary.attributes[original] || dictionary.placeholders[original] || dictionary.text[original];

    element.dataset[datasetKey] = original;

    if (currentLanguage === DEFAULT_LANGUAGE) {
      element.setAttribute(attribute, original);
      return;
    }

    if (translated) {
      element.setAttribute(attribute, translated);
    }
  };

  const updateDocumentTitle = () => {
    const page = document.body?.dataset.page || document.body?.dataset.authPage || document.querySelector("[data-auth-page]")?.dataset.authPage || "";
    const titleKey = page === "forgot-password" ? "forgot" : page || (document.body?.classList.contains("loginPage") ? "login" : "");
    const nextTitle = getDictionary().titles[titleKey];

    if (nextTitle) {
      document.title = nextTitle;
    }
  };

  const applyTranslations = () => {
    if (!document.body || isApplyingTranslations) return;

    isApplyingTranslations = true;
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(translateElementKey);

    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!normalizeText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (textWalker.nextNode()) {
      textNodes.push(textWalker.currentNode);
    }

    textNodes.forEach(translateTextNode);

    const dictionary = getDictionary();
    document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
      translateAttribute(element, "placeholder", "i18nOriginalPlaceholder", dictionary);
      translateAttribute(element, "aria-label", "i18nOriginalAriaLabel", dictionary);
      translateAttribute(element, "title", "i18nOriginalTitle", dictionary);
    });

    updateDocumentTitle();
    isApplyingTranslations = false;
  };

  const scheduleApplyTranslations = () => {
    if (observerFrame) return;

    observerFrame = window.requestAnimationFrame(() => {
      observerFrame = 0;
      applyTranslations();
    });
  };

  const updateLanguageControls = () => {
    document.querySelectorAll(".js-language-toggle").forEach((button) => {
      const isActive = button.dataset.language === currentLanguage;
      button.classList.toggle("language-toggle__button--active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll(".js-settings-language").forEach((input) => {
      input.checked = input.value === currentLanguage;
    });
  };

  const setLanguage = (language, shouldSave = true) => {
    const nextLanguage = getValidLanguage(language);

    currentLanguage = nextLanguage;

    if (shouldSave) {
      saveLanguage(nextLanguage);
    }

    updateLanguageControls();
    applyTranslations();
    window.dispatchEvent(new CustomEvent("crm:languagechange", { detail: { language: nextLanguage } }));
  };

  window.crmI18n = {
    t: translate,
    setLanguage,
    getLanguage: () => currentLanguage,
    applyTranslations,
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".js-language-toggle");

    if (!button) return;

    setLanguage(button.dataset.language);
  });

  updateLanguageControls();
  applyTranslations();

  const observer = new MutationObserver((mutations) => {
    if (isApplyingTranslations) return;
    if (mutations.some((mutation) => mutation.addedNodes.length || mutation.type === "characterData")) {
      scheduleApplyTranslations();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
