# AI Usage Log

This log documents how AI assistance was used during the 10X CRM project. Each entry follows the PRD format: goal, prompt and tool, result, and what was learned.

## Entry 1 - PRD Review and Markup Planning

**Goal:** Understand the CRM requirements and plan the first markup structure before writing JavaScript.

**Prompt and tool:** Codex. Prompt: "I am building CRM platform, with PRD file... for the first step, make sure that you will read the PRD, and build ready markup fully..."

**Result:** Used and adapted. The PRD was reviewed and the project structure was planned around public auth pages, protected dashboard/client/profile pages, reusable SCSS components, and JS-friendly class names.

**What I learned:** Reading the PRD first makes the HTML structure easier to connect with JavaScript later, especially when every form, button, and state has a predictable class or id.

## Entry 2 - Auth Page Branding and Theme Controls

**Goal:** Improve the sign-in and sign-up pages so the 10X CRM branding is clear and the theme toggle works with icons.

**Prompt and tool:** Codex. Prompt: "what about if we change logo and 10X CRM name here? on both log-in and sign-up pages I want 10X CRM be on both pages..."

**Result:** Used and adapted. The brand text was made more visible, the theme controller was connected to dark/light icon sources, and the auth pages kept the same visual identity.

**What I learned:** Small UI details like brand size and consistent icons make separate pages feel like one product, not disconnected screens.

## Entry 3 - Profile Avatar Upload

**Goal:** Add profile image upload, instant preview, remove action, and keep the profile textarea fixed-size.

**Prompt and tool:** Codex. Prompt: "profile-page - user should be able to add image on profile and the image should be visible straightaway on profile..."

**Result:** Used and adapted. The profile avatar preview stores the image in localStorage, updates immediately, and can be removed with an icon button. The textarea resize behavior was disabled.

**What I learned:** FileReader is useful for local image previews, and localStorage can preserve demo profile data between reloads without a backend.

## Entry 4 - Add Client Modal Planning and UI

**Goal:** Decide how the Add Client action should work and build the modal structure without implementing the full client-saving logic yet.

**Prompt and tool:** Codex. Prompt: "ok, do it with dark/light theme full responsive"

**Result:** Used and adapted. The Add Client modal was kept as HTML markup, styled through SCSS, and connected to a reusable modal controller for open, close, overlay click, Escape key, and focus handling.

**What I learned:** Keeping modal markup in HTML is cleaner for this project stage, while JavaScript should control interaction and later handle validation and rendering.

## Entry 5 - Prompt Refinement for Forgot Password Flow

**Goal:** Plan the forgot-password page for users who are not logged in.

**Prompt and tool:** Codex. Initial prompt: "on login page we have forgot password link, let's plan the page for it..." Refined prompt: "can we make two footer link? so client can choose where to return on sign in or sign up?"

**Result:** Used and adapted. The first prompt produced the page plan. The refined prompt improved the footer UX by adding both Sign In and Sign Up paths.

**What I learned:** Refining a prompt with a specific UX concern leads to a better user flow. A public forgot-password page should not require authentication.

## Entry 6 - Critical Review of AI Output

**Goal:** Keep AI output aligned with the project stage and avoid adding too much JavaScript too early.

**Prompt and tool:** Codex. Prompt direction used across the project: "not create all ready JavaScript at first, just finish working on fully responsive markup..."

**Result:** Partly used, partly postponed. Markup, SCSS, theme switching, password visibility, logout, avatar preview, modal open/close, and forgot-password validation were added. Full client CRUD and advanced auth logic were intentionally postponed.

**What I learned:** AI can overbuild if the task is not scoped. The best result comes from accepting only the parts that match the current milestone and delaying the rest.
