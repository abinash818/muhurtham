# Advanced KP Muhurtham Engine (Share Market)

A high-precision KP Astrology (Krishnamurti Padhdhati) Muhurtham scoring engine designed specifically for analyzing favorable times for Share Market entry (Buy/Sell).

## ✨ Credits & Inspiration
The advanced scoring and rejection rules in this application are inspired by the profound research and techniques of **[S. Ganeshakumar](https://www.facebook.com/sghaneshakumar.mantradhi)**. His insights into KP Astrology have been instrumental in crafting the logic for this engine.

## 🚀 Key Features
- **Intelligent Scoring Hierarchy**: Prioritizes Lagna Sub Lord (100%), Star Lord/Moon (60%), and Sign Lord (30%).
- **Cuspal Confirmation**: Bonus points for confirmations from the 2nd, 6th, 10th, and 11th cusps.
- **Advanced Hard Rejections**: Automatic "Avoid" signal for negative house connections (5, 8, 9, 12).
- **Lagna-Specific Filters**: Custom rules for Taurus and Scorpio Lagnas to ensure maximum accuracy.
- **Dynamic 24h Timeline**: Visualizes profit potential throughout the day.
- **Precision Search**: Global city search with automatic coordinate and timezone fetching.

## 🛠️ Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Backend URL**:
    Open the `.env` file in this folder and replace the placeholder URL with your actual Railway backend URL:
    ```
    VITE_BACKEND_URL=https://your-railway-backend-url.railway.app
    ```

3.  **Build for Hosting**:
    Run the build command to generate the static files:
    ```bash
    npm run build
    ```
    The output will be in the `dist` folder.

4.  **Shared Hosting Deployment**:
    Upload the contents of the `dist` folder to your shared hosting account (via FTP or File Manager).

## Key Features
- Dynamic 24-hour KP Timeline generation.
- High-precision location search using `country-state-city`.
- Automatic timezone calculation.
- Sign, Nakshatra, and Sub Lord display levels.
- Fully responsive UI using Material UI.
