# بلاغات الصيانة — AI Maintenance Request Classifier

### Overview

**AI Maintenance Request Classifier** is an application for submitting home-maintenance and craftsman service requests in Arabic.

The user describes their maintenance problem using free text. **Google Gemini** analyzes the request and suggests a **category** and **priority**. The user can review and adjust either value before saving the request.

Once saved, every maintenance request appears in a list where it can be reviewed and managed.

The project includes both a **Web version** and a **Mobile version**.

---

### Tech Stack & Reasoning

* **Next.js** — Used to build the Web application. It provides a modern framework for building web applications and supports API integration without requiring additional external libraries.
* **React Native / Expo** — Used for the Mobile application, based on previous experience with React Native.
* **Google Gemini API** — Used to analyze maintenance requests, suggest the appropriate category and priority, and provide AI-powered classification. Gemini was also used during the planning and development process to analyze requirements, suggest suitable tools, and help write project content.
* **Render** — Used to deploy and host the Web application, taking advantage of its available free hosting plan.
* **Claude** — Used during development to generate most of the application code, followed by manual review, modification, and refinement.

---

## Running the Project Locally

### Web Version

```bash
npm install

cp .env.local.example .env.local

# Then edit .env.local and add your Google Gemini API key.
# You can get a free API key from:
# https://aistudio.google.com/app/apikey

npm run dev
```

Then open:

http://localhost:3000

---

### Mobile Version

Install the dependencies:

```bash
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Add your **Google Gemini API key** to the `.env` file.

Then start the Expo development server:

```bash
npx expo start
```

---

## Future Improvements

* Connect the application to a real database for persistent data storage.
* Add a **Dashboard** for monitoring, reviewing, and managing maintenance requests.
* Allow users to upload **images and videos** to better describe the maintenance problem.

---
