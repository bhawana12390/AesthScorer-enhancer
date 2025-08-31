# ImageBoost AI: AI-Powered Image Enhancement

ImageBoost AI is a web application that allows you to assess and enhance the quality of your images using powerful machine learning models. Upload an image, get an initial quality score, and then see the magic happen as our AI enhances it. The application provides a clear side-by-side comparison of the original and enhanced images, along with detailed metrics on the quality improvement.

## ✨ Features

-   **Image Quality Assessment**: Get a numerical quality score (from 1 to 10) for any uploaded image.
-   **AI-Powered Image Enhancement**: Enhance your images using a state-of-the-art Real-ESRGAN model to improve resolution and clarity.
-   **Side-by-Side Comparison**: A clear and intuitive interface to compare the original and enhanced images, highlighting the improvements.
-   **Detailed Analysis**: View metrics like processing time, image dimensions, scale factor, and percentage of quality improvement.
-   **Enhancement History**: A persistent sidebar keeps track of all your previous enhancements, allowing you to revisit the results at any time.
-   **Modern UI**: A sleek and responsive interface built with Next.js, ShadCN UI, and Tailwind CSS.
-   **Theme Support**: Switch between Light, Dark, and System themes for your viewing preference.
-   **Drag & Drop Uploader**: Easily upload images by dragging and dropping them into the application.

## 🛠️ Tech Stack

-   **Frontend**:
    -   [Next.js](https://nextjs.org/) (React Framework)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [ShadCN UI](https://ui.shadcn.com/) (Component Library)
    -   [Tailwind CSS](https://tailwindcss.com/) (Styling)
    -   [Lucide React](https://lucide.dev/guide/packages/lucide-react) (Icons)
-   **Backend**:
    -   [FastAPI](https://fastapi.tiangolo.com/) (Python Web Framework)
    -   [PyTorch](https://pytorch.org/) (Machine Learning)
    -   [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) (Enhancement Model)
    -   Custom Image Scoring Model

---

## 🚀 Getting Started

To run this project locally, you will need to set up both the backend (FastAPI) and the frontend (Next.js) separately.

### 1. Backend Setup (FastAPI)

The backend server is responsible for running the machine learning models to rate and enhance images.

**Prerequisites:**
- Python 3.11+
- `pip` and `venv`

**Installation:**

1.  **Clone the repository and navigate to the backend directory:**
    ```bash
    # Assuming your backend code is in a 'backend' subfolder
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install the required Python packages:**
    *(You will need a `requirements.txt` file for your FastAPI project)*
    ```bash
    pip install -r requirements.txt
    ```

4.  **Download the ML Models:**
    Place your model files (`best_model_3.pth` and `RealESRGAN_x4plus_anime_6B.pth`) into a `ml_models` directory within your backend folder.

5.  **Run the FastAPI server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The backend API should now be running at `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

The frontend is the Next.js application that you interact with in the browser.

**Prerequisites:**
- Node.js 18+
- `npm` or `yarn`

**Installation:**

1.  **Navigate to the frontend project directory:**
    *(This is the root of your Next.js project)*

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    The frontend needs to know where the backend is running. The application already handles this by default, assuming the FastAPI server is at `http://localhost:8000`. If your backend is running on a different URL, create a `.env.local` file in the root of the frontend project and add the following line:
    ```
    FASTAPI_ENDPOINT_URL=http://your-backend-url:port
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to see the application.

You are now all set up! Upload an image to start the enhancement process.
