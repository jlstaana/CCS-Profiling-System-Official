# CCS Profiling System

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</p>

## 📖 Overview

The **CCS (College of Computer Studies) Profiling System** is a full-stack web application designed to manage student and faculty profiles, handle robust scheduling capabilities, and streamline academic record keeping. Built with a modern tech stack featuring a React/Vite frontend and a Laravel backend, the system offers high performance, secure authentication, and an intuitive user experience.

## ✨ Features

- **Robust User Authentication**: Secure login and role-based access control (Admin, Faculty, Student) utilizing Laravel Sanctum.
- **Advanced Scheduling Module**: 
  - Dynamic filtering by Degree Programs (e.g., BSCS, BSIT).
  - Year level and section categorization for seamless schedule management.
- **Comprehensive Profiling**: Maintain detailed records for students and faculty.
- **Modern UI/UX**: Responsive and premium user interface providing a frictionless experience across all devices.
- **Cross-Origin Configuration**: Fully configured CORS handling cross-device and cross-environment (Local, Ngrok, Vercel, Railway) interactions securely.

## 💻 Tech Stack

### Frontend
- **React.js** (built with Vite for optimal performance)
- **Tailwind CSS** / Vanilla CSS for styling (Modern, glassmorphic UI)
- Hosted on **Vercel**

### Backend
- **Laravel 11.x** (PHP Framework)
- **MySQL / PostgreSQL** Database
- Hosted on **Railway**

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.x or higher)
- [PHP](https://www.php.net/) (v8.1 or higher)
- [Composer](https://getcomposer.org/)
- [MySQL](https://www.mysql.com/)

### 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/CCS-Profiling-System-Official.git
   cd CCS-Profiling-System-Official
   ```

2. **Backend Setup (Laravel):**
   ```bash
   cd Backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
   - Update `.env` with your database credentials.
   - Run database migrations and seeders:
   ```bash
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend Setup (React/Vite):**
   ```bash
   cd ../Frontend
   npm install
   cp .env.example .env
   ```
   - Update `.env` with the backend API URL (e.g., `VITE_API_BASE_URL=http://localhost:8000`).
   - Start the development server:
   ```bash
   npm run dev
   ```

## 🌍 Deployment

### Vercel (Frontend)
The React frontend is seamlessly configured for Vercel deployment. Ensure `VITE_API_BASE_URL` in Vercel's environment variables points to your production backend URL.

### Railway (Backend)
The Laravel API is optimized to be deployed on Railway. Remember to:
- Set up database services in Railway.
- Apply production environment variables (`APP_ENV=production`, `APP_DEBUG=false`, Database URLs, etc.).
- Ensure CORS configurations in `config/cors.php` allow requests from the Vercel domain.

## 📂 Project Structure

```text
CCS-Profiling-System-Official/
├── Backend/                 # Laravel API application
│   ├── app/                 # Controllers, Models, Middleware
│   ├── config/              # Configuration files (CORS, Auth)
│   ├── database/            # Migrations and Seeders
│   └── routes/              # API routes
└── Frontend/                # React Vite application
    ├── public/              # Static assets
    ├── src/                 # React components, pages, context
    └── package.json         # Frontend dependencies and scripts
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.